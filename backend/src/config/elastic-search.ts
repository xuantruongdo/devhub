import { es } from "../libs/elastic-search";
import { UserSearchIndexService } from "../indices/user";

export const initElasticSearch = async () => {
  try {
    await es.ping();
    console.log("🔎 Elasticsearch connected");

    const userSearchIndexService = new UserSearchIndexService();
    await userSearchIndexService.ensureCreated();

    console.log("✅ Elasticsearch index ready");
  } catch (error) {
    console.error("❌ Elasticsearch connection failed", error);
  }

  return es;
};
