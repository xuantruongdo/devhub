import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Index,
} from "typeorm";
import { User } from "./User";
import { Conversation } from "./Conversation";

@Entity()
@Index(["conversationId", "userId"], { unique: true })
export class ConversationParticipant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  conversationId!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => Conversation, (c) => c.participants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "conversationId" })
  conversation!: Conversation;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ nullable: true })
  lastReadMessageId?: number;

  @Column({ default: 0 })
  unreadCount!: number;

  @Column({ default: false })
  isMuted!: boolean;
}
