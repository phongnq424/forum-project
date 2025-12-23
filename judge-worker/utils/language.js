export const languages = {
    cpp: {
        image: process.env.DOCKER_IMAGE_CPP || 'sandbox-cpp',
        filename: 'cpp',
        compileCmd: ['g++', 'code.cpp', '-o', 'main', '-O2', '-static'],
        runCmd: ['./main'],
    },
    python: {
        image: process.env.DOCKER_IMAGE_PYTHON || 'sandbox-python',
        filename: 'py',
        compileCmd: null,
        runCmd: ['python3', 'code.py'],
    },
};