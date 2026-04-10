import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { User } from "./User";

export enum NotificationType {
  LIKE_POST = "like_post",
  LIKE_COMMENT = "like_comment",
  COMMENT = "comment",
  FOLLOW = "follow",
}

@Entity()
@Index(["recipientId", "isRead"])
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  recipientId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "recipientId" })
  recipient!: User;

  @Column()
  senderId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "senderId" })
  sender!: User;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type!: NotificationType;

  @Column({ nullable: true })
  postId?: number;

  @Column({ nullable: true })
  commentId?: number;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
