import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class PostShare {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  post!: Post;

  // optional: caption khi share
  @Column({ type: "text", nullable: true })
  content?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
