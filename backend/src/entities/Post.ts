import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { User } from "./User";
import { PostLike } from "./PostLike";
import { Comment } from "./Comment";
import { PostShare } from "./PostShare";

export enum PostVisibility {
  PUBLIC = "public",
  FRIENDS = "friends",
  PRIVATE = "private",
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: "CASCADE",
  })
  @Index()
  author!: User;

  @Column("text", { nullable: true })
  content?: string;

  @Column({ type: "jsonb", nullable: true })
  images?: string[];

  // Privacy
  @Column({
    type: "enum",
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  @Index()
  visibility!: PostVisibility;

  // Share (reference post gốc)
  @ManyToOne(() => Post, {
    nullable: true,
    onDelete: "SET NULL",
  })
  sharedPost?: Post;

  @Column({ default: 0 })
  likeCount!: number;

  @Column({ default: 0 })
  commentCount!: number;

  @Column({ default: 0 })
  shareCount!: number;

  @OneToMany(() => PostLike, (like) => like.post)
  likes!: PostLike[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @OneToMany(() => PostShare, (share) => share.post)
  shares!: PostShare[];

  @Column({ nullable: true })
  lastInteractionAt?: Date;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
