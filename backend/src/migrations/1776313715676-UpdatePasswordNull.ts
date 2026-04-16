import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePasswordNull1776313715676 implements MigrationInterface {
    name = 'UpdatePasswordNull1776313715676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    }

}
