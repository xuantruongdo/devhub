import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Conversation } from "./Conversation";
import { User } from "./User";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

@Entity()
@Index(["conversationId"])
@Index(["senderId"])
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  conversationId!: number;

  @Column()
  senderId!: number;

  @Column({
    type: "enum",
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type!: MessageType;

  @Column("text", { nullable: true })
  content?: string;

  @Column({ nullable: true })
  fileUrl?: string;

  @ManyToOne(() => Conversation, (c) => c.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "conversationId" })
  conversation!: Conversation;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "senderId" })
  sender!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
