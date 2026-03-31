export const languages = {
    cpp: {
        image: process.env.DOCKER_IMAGE_CPP || 'sandbox-cpp',
        filename: 'code.cpp',
        compileCmd: ['g++', 'code.cpp', '-o', 'main', '-O2', '-static'],
        runCmd: ['timeout', '2s', './main'],
    },
    py: {
        image: process.env.DOCKER_IMAGE_PYTHON || 'sandbox-python',
        filename: 'code.py',
        compileCmd: null,
        runCmd: ['timeout', '2s', 'python3', 'code.py']
    },
    sql: {
        image: process.env.DOCKER_IMAGE_SQL || 'sandbox-sql',
        filename: 'query.sql',
        compileCmd: null,
        runCmd: ['sh', '/runner/run-sql.sh']
    }
};