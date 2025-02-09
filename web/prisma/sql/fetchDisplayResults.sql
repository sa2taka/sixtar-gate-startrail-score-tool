WITH "RankedScores" AS (
  -- 各譜面ごとの最高スコアを取得
  SELECT DISTINCT ON ("r"."musicId", "r"."type", "r"."difficulty")
    "r"."musicId",
    "r"."type",
    "r"."difficulty",
    "r"."score",
    "r"."blueStar",
    "r"."whiteStar",
    "r"."yellowStar",
    "r"."redStar",
    "r"."pattern",
    "r"."hazard"
  FROM "Result" AS "r"
  WHERE 
    "r"."userId" = $1
    AND "r"."type" = $2
    AND "r"."difficulty" = $3
  ORDER BY "r"."musicId", "r"."type", "r"."difficulty", "r"."score" DESC
),
"RankedHazards" AS (
  -- 各譜面ごとの最高クリアハザードを取得
  SELECT DISTINCT ON ("r"."musicId", "r"."type", "r"."difficulty")
    "r"."musicId",
    "r"."type",
    "r"."difficulty",
    "r"."hazard",
    "r"."redStar",
    "r"."yellowStar",
    "r"."whiteStar"
  FROM "Result" AS "r"
  WHERE 
    "r"."userId" = $1
    AND "r"."type" = $2
    AND "r"."difficulty" = $3
  ORDER BY 
    "r"."musicId", 
    "r"."type", 
    "r"."difficulty",
    -- ハザードの優先順位付け
    CASE 
      WHEN "r"."score" = 1000000 OR ("r"."redStar" = 0 AND "r"."yellowStar" = 0 AND "r"."whiteStar" = 0) THEN 8  -- pure blue
      WHEN "r"."redStar" = 0 AND "r"."yellowStar" = 0 THEN 7                       -- pure white
      WHEN "r"."isFullCombo" OR "r"."redStar" = 0 THEN 6                                           -- フルコンボ
      WHEN "r"."hazard" = 'DEADEND' THEN 5
      WHEN "r"."hazard" = 'LV3' THEN 4
      WHEN "r"."hazard" = 'LV2' THEN 3
      WHEN "r"."hazard" = 'LV1' THEN 2
      WHEN "r"."hazard" = 'DEFAULT' THEN 1
      ELSE 0
    END DESC
)
-- 最終結果の結合
SELECT 
  "m"."id" AS "music_id",
  "m"."name" AS "music_name",
  "m"."englishName" AS "music_english_name",
  "c"."type",
  "c"."difficulty",
  "c"."level",
  "rs"."score" AS "best_score",
  "rs"."blueStar" AS "best_score_blue_star",
  "rs"."whiteStar" AS "best_score_white_star",
  "rs"."yellowStar" AS "best_score_yellow_star",
  "rs"."redStar" AS "best_score_red_star",
  "rs"."pattern" AS "best_score_pattern",
  "rs"."hazard" AS "best_score_hazard",
  "rh"."hazard" AS "best_clear_hazard"
FROM "Chart" as "c"
JOIN "Music" as "m" ON "c"."musicId" = "m"."id"
LEFT JOIN "RankedScores" as "rs" ON 
  "c"."musicId" = "rs"."musicId" AND 
  "c"."type" = "rs"."type" AND 
  "c"."difficulty" = "rs"."difficulty"
LEFT JOIN "RankedHazards" as "rh" ON 
  "c"."musicId" = "rh"."musicId" AND 
  "c"."type" = "rh"."type" AND 
  "c"."difficulty" = "rh"."difficulty"
ORDER BY 
  "m"."id",
  "c"."type",
  "c"."difficulty";
