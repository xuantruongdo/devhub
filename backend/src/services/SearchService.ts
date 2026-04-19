import { USER_INDEX } from "../indices/user";
import { Service } from "typedi";
import { redis } from "../libs/redis";
import { es } from "../libs/elastic-search";
import { SearchUsersParams, SearchUsersResult, UserHit } from "../types/search";
import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { BadRequestError } from "routing-controllers";

@Service()
export class SearchService {
  private static readonly CACHE_TTL = 30;

  async search(params: SearchUsersParams): Promise<SearchUsersResult> {
    try {
      const { q, from = 0, size = 20, verified } = params;

      // normalize input user
      const query = q.trim();
      if (!query) return { hits: [], total: 0, took: 0 };

      // phân biệt pagination + filter + query
      const cacheKey = `search:users:${query}:${from}:${size}:${verified ?? "all"}`;

      // check cache trước
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as SearchUsersResult;

      // query ES nếu cache miss
      const result = await this.executeQuery({
        query,
        from,
        size,
        verified,
      });

      // cache result
      await redis.set(
        cacheKey,
        JSON.stringify(result),
        "EX",
        SearchService.CACHE_TTL,
      );

      return result;
    } catch (error: any) {
      throw new BadRequestError(error.message);
    }
  }

  /**
   * ELASTICSEARCH QUERY CORE
   *
   * Đây là phần quan trọng nhất:
   * - search logic
   * - ranking
   * - filtering
   */
  private async executeQuery({
    query,
    from,
    size,
    verified,
  }: {
    query: string;
    from: number;
    size: number;
    verified?: boolean;
  }): Promise<SearchUsersResult> {
    /**
     * FILTERS (hard constraints)
     *
     * - loại user đã xoá (soft delete)
     * - filter verified nếu có
     */
    const filters: QueryDslQueryContainer[] = [
      {
        bool: {
          must_not: {
            exists: {
              field: "deletedAt",
            },
          },
        },
      },
    ];

    // filter verified user
    if (verified !== undefined) {
      filters.push({
        term: { isVerified: verified },
      });
    }

    /**
     * MAIN SEARCH QUERY
     *
     * function_score = kết hợp:
     * - relevance (text match)
     * - business ranking (followers, verified)
     */
    const response = await es.search({
      index: USER_INDEX,
      from,
      size,

      query: {
        function_score: {
          // BASE QUERY (text search)
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,

                    /**
                     * ranking importance:
                     * username > fullName > bio
                     */
                    fields: ["username^3", "fullName^2", "bio"],

                    type: "best_fields",

                    /**
                     * fuzziness giúp:
                     * "truongg" → "truong"
                     */
                    fuzziness: "AUTO",

                    /**
                     * tối ưu performance:
                     * tránh fuzzy quá sớm gây noise
                     */
                    prefix_length: 2,
                  },
                },
              ],

              filter: filters,
            },
          },

          /**
           * SCORING FUNCTIONS
           *
           * kết hợp business logic vào ranking
           */
          functions: [
            /**
             * boost theo follower count
             * càng nhiều follower → càng rank cao
             */
            {
              field_value_factor: {
                field: "followerCount",
                factor: 0.5,
                modifier: "log1p",
                missing: 0,
              },
            },

            /**
             * boost verified user
             */
            {
              filter: { term: { isVerified: true } },
              weight: 1.5,
            },
          ],

          /**
           * cách combine score
           */
          score_mode: "sum",
          boost_mode: "multiply",
        },
      },
    });

    /**
     * MAP RESULTS
     * - convert ES hit → frontend format
     */
    const hits: UserHit[] = response.hits.hits.map((hit) => ({
      ...(hit._source as Omit<UserHit, "score">),
      score: hit._score ?? 0,
    }));

    /**
     * total hits handling
     * ES trả về 2 format (number hoặc object)
     */
    const total =
      typeof response.hits.total === "number"
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    return {
      // Danh sách các document phù hợp với query
      hits,

      // Tổng số document match query (không bị giới hạn bởi pagination)
      total,

      // Thời gian Elasticsearch xử lý query (ms)
      took: response.took,
    };
  }
}
