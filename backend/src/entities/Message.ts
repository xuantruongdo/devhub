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
  CALL = "call",
}

export enum CallStatus {
  REJECTED = "rejected",
  TIMEOUT = "timeout",
  ENDED = "ended",
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

  @Column({ nullable: true })
  callDuration?: number;

  @Column({ nullable: true })
  callStatus?: CallStatus;

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
