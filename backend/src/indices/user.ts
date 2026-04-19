// Indices: API quản lý các index
import { es } from "../libs/elastic-search";

// Tên index (giống table trong SQL)
export const USER_INDEX = "users";

export class UserSearchIndexService {
  async ensureCreated(): Promise<void> {
    const exists = await es.indices.exists({
      index: USER_INDEX,
    });

    if (exists) {
      console.log("Index already exists:", USER_INDEX);
      return;
    }

    // CREATE INDEX
    await es.indices.create({
      index: USER_INDEX,

      // SETTINGS: Cách Elasticsearch xử lý dự liệu
      // Elasticsearch KHÔNG lưu nguyên câu này để search
      // Nó sẽ biến thành nhiều mảnh nhỏ (tokens)
      settings: {
        analysis: {
          analyzer: {
            // autocomplete_analyzer (INDEX TIME)
            // Dùng khi lưu data vào Elasticsearch
            // Tạo nhiều token dạng prefix (edge_ngram)
            // Phục vụ autocomplete (gõ "tru" vẫn ra "truong")
            autocomplete_analyzer: {
              type: "custom",
              tokenizer: "autocomplete_tokenizer",
              filter: [
                "lowercase",
                "asciifolding", // remove dấu tiếng Việt
              ],
            },

            // autocomplete_search_analyzer (SEARCH TIME)
            // Dùng khi user nhập search
            // KHÔNG dùng edge_ngram
            // Chỉ normalize (lowercase + bỏ dấu)
            // Giữ query sạch để match chính xác
            autocomplete_search_analyzer: {
              type: "custom",
              tokenizer: "standard",
              filter: ["lowercase", "asciifolding"],
            },

            // Dùng cho full-text search (bio, location...)
            vi_standard_analyzer: {
              type: "custom",
              tokenizer: "standard",
              filter: ["lowercase", "asciifolding"],
            },
          },

          tokenizer: {
            autocomplete_tokenizer: {
              type: "edge_ngram",
              min_gram: 1,
              max_gram: 20,
              token_chars: ["letter", "digit"],
            },
          },

          normalizer: {
            lowercase_normalizer: {
              type: "custom",
              filter: ["lowercase", "asciifolding"],
            },
          },
        },
      },

      // MAPPINGS: Schema của document
      mappings: {
        properties: {
          id: { type: "integer" },
          username: {
            type: "text",
            analyzer: "autocomplete_analyzer",
            search_analyzer: "autocomplete_search_analyzer",
            fields: {
              keyword: {
                type: "keyword",
                normalizer: "lowercase_normalizer",
              },
            },
          },
          fullName: {
            type: "text",
            analyzer: "autocomplete_analyzer",
            search_analyzer: "autocomplete_search_analyzer",
            fields: {
              keyword: {
                type: "keyword",
                normalizer: "lowercase_normalizer",
              },
            },
          },
          bio: {
            type: "text",
            analyzer: "vi_standard_analyzer",
          },
          avatar: {
            type: "keyword",
            index: false,
          },
          email: {
            type: "keyword",
            normalizer: "lowercase_normalizer",
          },
          location: {
            type: "text",
            analyzer: "vi_standard_analyzer",
          },
          isVerified: {
            type: "boolean",
          },
          isActive: {
            type: "boolean",
          },
          followerCount: {
            type: "integer",
          },
          followingCount: {
            type: "integer",
          },
          postCount: {
            type: "integer",
          },
          createdAt: {
            type: "date",
          },
          deletedAt: {
            type: "date",
          },
        },
      },
    });

    console.log("Created index:", USER_INDEX);
  }

  async deleteIndex(): Promise<void> {
    const exists = await es.indices.exists({
      index: USER_INDEX,
    });

    if (!exists) {
      console.log("Index does not exist:", USER_INDEX);
      return;
    }

    await es.indices.delete({
      index: USER_INDEX,
    });

    console.log("Deleted index:", USER_INDEX);
  }
}
