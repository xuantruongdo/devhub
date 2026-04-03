import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

@Entity()
@Index(["commentId", "userId"], { unique: true })
export class CommentLike {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commentId!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => Comment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "commentId" })
  comment!: Comment;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;
}
