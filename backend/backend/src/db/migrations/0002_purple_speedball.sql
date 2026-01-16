CREATE TABLE "acces_dossiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id_dossier" uuid NOT NULL,
	"id_medecin" uuid NOT NULL,
	"date_autorisation" timestamp DEFAULT now() NOT NULL,
	"statut" varchar(20) DEFAULT 'ACTIF',
	"type_acces" varchar(20) DEFAULT 'LECTURE'
);
--> statement-breakpoint
ALTER TABLE "rendez_vous" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "connexions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "rendez_vous" CASCADE;--> statement-breakpoint
DROP TABLE "connexions" CASCADE;--> statement-breakpoint
ALTER TABLE "dossiers_medicaux" DROP CONSTRAINT "dossiers_medicaux_id_medecin_users_id_fk";
--> statement-breakpoint
ALTER TABLE "acces_dossiers" ADD CONSTRAINT "acces_dossiers_id_dossier_dossiers_medicaux_id_fk" FOREIGN KEY ("id_dossier") REFERENCES "public"."dossiers_medicaux"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acces_dossiers" ADD CONSTRAINT "acces_dossiers_id_medecin_users_id_fk" FOREIGN KEY ("id_medecin") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossiers_medicaux" DROP COLUMN "id_medecin";