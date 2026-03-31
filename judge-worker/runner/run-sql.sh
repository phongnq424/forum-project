#!/bin/sh
set -eu

DB=/sandbox/db.sqlite
TMP_INPUT=/sandbox/raw_input.sql
USER_OUT=/sandbox/user_out.txt
DATA_SQL=/sandbox/data.sql
EXPECTED_OUT=/sandbox/expected_out.txt
USER_STATS=/sandbox/user_stats.txt
EXPECTED_STATS=/sandbox/expected_stats.txt
QUERY=/sandbox/query.sql
EXPECTED_SQL=/sandbox/expected_sql.sql
SCHEMA=/sandbox/schema.sql

rm -f "$DB" "$USER_OUT" "$EXPECTED_OUT" "$USER_STATS" "$EXPECTED_STATS" "$EXPECTED_SQL" "$TMP_INPUT"
cat - > "$TMP_INPUT"

awk '/--EXPECTED_SQL_START--/{flag=1;next} /--EXPECTED_SQL_END--/{flag=0; next} flag{print > "/sandbox/expected_sql.sql"}' "$TMP_INPUT"


if [ -f "$SCHEMA" ] && [ -s "$SCHEMA" ]; then
  sqlite3 "$DB" < "$SCHEMA"
fi

if [ -f "$DATA_SQL" ] && [ -s "$DATA_SQL" ]; then
  sqlite3 "$DB" < "$DATA_SQL"
fi

if [ -f "$QUERY" ] && [ -s "$QUERY" ]; then
  (echo ".headers on"; echo ".mode csv"; echo ".stats on"; cat "$QUERY") | sqlite3 "$DB" > /sandbox/tmp_user.txt || true

    awk '/Memory Used:/,0 {print > "'"$USER_STATS"'"; next} {print > "'"$USER_OUT"'"}' /sandbox/tmp_user.txt
else
  echo "__NO_USER_QUERY__" > "$USER_OUT"
fi

if [ -f "$EXPECTED_SQL" ] && [ -s "$EXPECTED_SQL" ]; then
  (echo ".headers on"; echo ".mode csv"; echo ".stats on"; cat "$EXPECTED_SQL") | sqlite3 "$DB" > /sandbox/tmp_expected.txt || true
   awk '/Memory Used:/,0 {print > "'"$EXPECTED_STATS"'"; next} {print > "'"$EXPECTED_OUT"'"}' /sandbox/tmp_expected.txt
else
  echo "__NO_EXPECTED_QUERY__" > "$EXPECTED_OUT"
fi

cat "$USER_OUT"
echo "__EXPECTED_RESULT_START__"
cat "$EXPECTED_OUT"
echo "__EXPECTED_RESULT_END__"
echo "__USER_STATS__"
cat "$USER_STATS"
echo "__EXPECTED_STATS__"
cat "$EXPECTED_STATS"