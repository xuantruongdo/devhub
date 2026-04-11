import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Column,
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
  title?: string

  @OneToMany(() => ConversationParticipant, (p) => p.conversation)
  participants!: ConversationParticipant[];

  @OneToMany(() => Message, (m) => m.conversation)
  messages!: Message[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
