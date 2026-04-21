import { Client } from "@elastic/elasticsearch";

class ElasticSearchClient {
  private static instance: Client;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Client({
        node: process.env.ES_URL!,
        auth: {
          username: process.env.ES_USERNAME!,
          password: process.env.ES_PASSWORD!,
          // apiKey: process.env.ES_API_KEY!,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.instance
        .ping()
        .then(() => {
          console.log("[ES] connected");
        })
        .catch((err) => {
          console.error("[ES] connection error", err);
        });
    }

    return this.instance;
  }
}

export const es = ElasticSearchClient.getInstance();
