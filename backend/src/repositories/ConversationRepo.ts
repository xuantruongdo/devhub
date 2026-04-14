import { Service } from "typedi";
import { BaseRepo } from "./BaseRepo";
import { Conversation } from "../entities/Conversation";
import { AppDataSource } from "../config/data-source";

@Service()
export class ConversationRepo extends BaseRepo<Conversation> {
  constructor() {
    super(Conversation, AppDataSource);
  }
}
