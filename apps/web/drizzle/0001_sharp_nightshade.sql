CREATE TABLE "fraud_attempts" (
	"attempt_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"action" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"transaction_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"balance_after" integer NOT NULL,
	"description" text,
	"metadata" jsonb,
	"idempotency_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reversed_at" timestamp,
	"reversal_transaction_id" uuid,
	CONSTRAINT "point_transactions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "market_positions" ADD COLUMN "amount_points" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "points_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "points_updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "daily_bonus_last_claimed_at" timestamp;--> statement-breakpoint
ALTER TABLE "fraud_attempts" ADD CONSTRAINT "fraud_attempts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fraud_attempts_user_idx" ON "fraud_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fraud_attempts_created_idx" ON "fraud_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "point_tx_user_created_idx" ON "point_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "point_tx_type_idx" ON "point_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "point_tx_idempotency_idx" ON "point_transactions" USING btree ("idempotency_key");