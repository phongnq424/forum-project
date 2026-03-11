-- CreateIndex
CREATE INDEX "Post_user_id_idx" ON "Post"("user_id");

-- CreateIndex
CREATE INDEX "Post_topic_id_idx" ON "Post"("topic_id");

-- CreateIndex
CREATE INDEX "Post_created_at_idx" ON "Post"("created_at");

-- CreateIndex
CREATE INDEX "Post_topic_id_created_at_idx" ON "Post"("topic_id", "created_at");

-- CreateIndex
CREATE INDEX "Submission_user_id_idx" ON "Submission"("user_id");

-- CreateIndex
CREATE INDEX "Submission_challenge_id_idx" ON "Submission"("challenge_id");

-- CreateIndex
CREATE INDEX "Submission_user_id_status_idx" ON "Submission"("user_id", "status");

-- CreateIndex
CREATE INDEX "Submission_challenge_id_status_idx" ON "Submission"("challenge_id", "status");

-- CreateIndex
CREATE INDEX "Submission_user_id_challenge_id_idx" ON "Submission"("user_id", "challenge_id");

-- CreateIndex
CREATE INDEX "Submission_submitted_at_idx" ON "Submission"("submitted_at");
