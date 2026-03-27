import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTable1774607109874 implements MigrationInterface {
    name = 'AddUserTable1774607109874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "fullName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "avatar" character varying, "bio" character varying, "website" character varying, "birthday" TIMESTAMP, "location" character varying, "isActive" boolean NOT NULL DEFAULT false, "isVerified" boolean NOT NULL DEFAULT false, "refreshToken" character varying, "lastLogin" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_followers" ("userId" integer NOT NULL, "followerId" integer NOT NULL, CONSTRAINT "PK_2ef3f0032f555df18ddc38c4552" PRIMARY KEY ("userId", "followerId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_347ce7a07457528a1779da8b8f" ON "user_followers" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c3f56a3157b50bc8adcc6acf27" ON "user_followers" ("followerId") `);
        await queryRunner.query(`ALTER TABLE "user_followers" ADD CONSTRAINT "FK_347ce7a07457528a1779da8b8f3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_followers" ADD CONSTRAINT "FK_c3f56a3157b50bc8adcc6acf278" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_followers" DROP CONSTRAINT "FK_c3f56a3157b50bc8adcc6acf278"`);
        await queryRunner.query(`ALTER TABLE "user_followers" DROP CONSTRAINT "FK_347ce7a07457528a1779da8b8f3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c3f56a3157b50bc8adcc6acf27"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_347ce7a07457528a1779da8b8f"`);
        await queryRunner.query(`DROP TABLE "user_followers"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
