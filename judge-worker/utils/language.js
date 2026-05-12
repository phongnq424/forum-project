export const languages = {
    cpp: {
        type: "stdio",
        image: process.env.DOCKER_IMAGE_CPP || "judge-cpp",
        filename: "code.cpp",
        compileCmd: ["g++", "code.cpp", "-o", "main", "-O2", "-static"],
        runCmd: ["./main"],
    },

    py: {
        type: "stdio",
        image: process.env.DOCKER_IMAGE_PYTHON || "judge-python",
        filename: "code.py",
        compileCmd: null,
        runCmd: ["python3", "code.py"],
    },

    sql: {
        type: "sql",
        image: process.env.DOCKER_IMAGE_SQL || "judge-sql",
        filename: "query.sql",
        compileCmd: null,
        runCmd: ["sh", "/runner/run-sql.sh"],
    },

    node_api: {
        type: "node_api",
        image: process.env.DOCKER_IMAGE_NODE || "judge-node",
        filename: "app.js",
        compileCmd: null,
        runCmd: ["sh", "/runner/run-node-server.sh"],
    },

    backend: {
        type: "node_api",
        image: process.env.DOCKER_IMAGE_NODE || "judge-node",
        filename: "app.js",
        compileCmd: null,
        runCmd: ["sh", "/runner/run-node-server.sh"],
    },
};