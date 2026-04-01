import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text")
  content!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  author!: User;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  post!: Post;

  // reply comment
  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: "CASCADE",
  })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  @Column({ default: 0 })
  likeCount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
