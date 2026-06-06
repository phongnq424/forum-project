import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 50 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 0 }
    ],
    thresholds: {
        http_req_failed: ["rate<0.05"],
        http_req_duration: ["p(95)<3000"]
    }
};

const BASE_URL = __ENV.BASE_URL;
const TOKEN = __ENV.TOKEN;

export default function () {
    const headers = {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
    };

    const postsRes = http.get(`${BASE_URL}/api/posts`, { headers });
    check(postsRes, {
        "posts status 200": (res) => res.status === 200
    });

    const challengesRes = http.get(`${BASE_URL}/api/challenges`, { headers });
    check(challengesRes, {
        "challenges status 200": (res) => res.status === 200
    });
    sleep(1);
}