import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ConversationParticipant } from "./ConversationParticipant";
import { Message } from "./Message";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: false })
  isGroup!: boolean;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  lastMessageId?: number;

  @ManyToOne(() => Message, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "lastMessageId" })
  lastMessage?: Message;

  @OneToMany(() => ConversationParticipant, (p) => p.conversation)
  participants!: ConversationParticipant[];

  @OneToMany(() => Message, (m) => m.conversation)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
