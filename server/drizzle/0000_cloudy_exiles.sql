CREATE TABLE IF NOT EXISTS "characters" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"rarity" varchar(16) NOT NULL,
	"attack_type" varchar(16) NOT NULL,
	"base_health" smallint NOT NULL,
	"base_speed" smallint NOT NULL,
	"base_damage" smallint NOT NULL,
	"texture_key" varchar(64) NOT NULL,
	"walk_texture" varchar(64),
	"ability_name" varchar(64),
	"ability_desc" varchar(1024),
	"unlock_cost" bigint DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_progress" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"current_level_id" smallint DEFAULT 1 NOT NULL,
	"lives" smallint DEFAULT 5 NOT NULL,
	"keys_collected" smallint DEFAULT 0 NOT NULL,
	"enemies_killed" integer DEFAULT 0 NOT NULL,
	"total_playtime_sec" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_servers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"region" varchar(32) NOT NULL,
	"mode" varchar(32) NOT NULL,
	"max_players" smallint NOT NULL,
	"current_players" smallint DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'online' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "level_progress" (
	"user_id" bigint NOT NULL,
	"level_id" smallint NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"stars" smallint DEFAULT 0 NOT NULL,
	"best_time_sec" integer,
	"deaths" smallint DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "level_progress_user_id_level_id_pk" PRIMARY KEY("user_id","level_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "levels" (
	"id" smallint PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"map_image_url" varchar(255),
	"unlock_order" smallint NOT NULL,
	"is_boss_level" boolean DEFAULT false NOT NULL,
	"par_time_sec" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "levels_unlock_order_unique" UNIQUE("unlock_order")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lobbies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"name" varchar(64) NOT NULL,
	"mode" varchar(32) NOT NULL,
	"max_players" smallint DEFAULT 5 NOT NULL,
	"is_private" boolean DEFAULT true NOT NULL,
	"creator_id" bigint NOT NULL,
	"status" varchar(16) DEFAULT 'waiting' NOT NULL,
	"level_id" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	CONSTRAINT "lobbies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lobby_players" (
	"lobby_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"slot" smallint NOT NULL,
	"character_id" varchar(32),
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_ready" boolean DEFAULT false NOT NULL,
	CONSTRAINT "lobby_players_lobby_id_user_id_pk" PRIMARY KEY("lobby_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_stats" (
	"match_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"kills" smallint DEFAULT 0 NOT NULL,
	"deaths" smallint DEFAULT 0 NOT NULL,
	"keys_collected" smallint DEFAULT 0 NOT NULL,
	"damage_dealt" integer DEFAULT 0 NOT NULL,
	"coins_earned" bigint DEFAULT 0 NOT NULL,
	"xp_earned" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "match_stats_match_id_user_id_pk" PRIMARY KEY("match_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "matches" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"mode" varchar(32) NOT NULL,
	"level_id" smallint NOT NULL,
	"winner_id" bigint,
	"duration_ms" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "missions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(128) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"mission_type" varchar(32) NOT NULL,
	"target_value" integer NOT NULL,
	"reward_coins" bigint DEFAULT 0 NOT NULL,
	"reward_xp" bigint DEFAULT 0 NOT NULL,
	"is_daily" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_characters" (
	"user_id" bigint NOT NULL,
	"character_id" varchar(32) NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"skin_variant" varchar(32) DEFAULT 'default',
	CONSTRAINT "player_characters_user_id_character_id_pk" PRIMARY KEY("user_id","character_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_profiles" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"display_name" varchar(32) NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"xp" bigint DEFAULT 0 NOT NULL,
	"coins" bigint DEFAULT 0 NOT NULL,
	"equipped_character_id" varchar(32),
	"total_playtime_sec" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_missions" (
	"user_id" bigint NOT NULL,
	"mission_id" bigint NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp with time zone,
	"reset_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_missions_user_id_mission_id_reset_date_pk" PRIMARY KEY("user_id","mission_id","reset_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(32) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"provider" varchar(32) DEFAULT 'local',
	"provider_id" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_progress" ADD CONSTRAINT "game_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_progress" ADD CONSTRAINT "game_progress_current_level_id_levels_id_fk" FOREIGN KEY ("current_level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobbies" ADD CONSTRAINT "lobbies_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobbies" ADD CONSTRAINT "lobbies_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobby_players" ADD CONSTRAINT "lobby_players_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."lobbies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobby_players" ADD CONSTRAINT "lobby_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lobby_players" ADD CONSTRAINT "lobby_players_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_stats" ADD CONSTRAINT "match_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "match_stats" ADD CONSTRAINT "match_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matches" ADD CONSTRAINT "matches_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_characters" ADD CONSTRAINT "player_characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_characters" ADD CONSTRAINT "player_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verifications_email" ON "email_verifications" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_lobby_slot" ON "lobby_players" USING btree ("lobby_id","slot");