const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

function indexById(name, items, issues) {
  const map = new Map();
  items.forEach((item, index) => {
    if (!item.id) {
      issues.push(`${name}[${index}] is missing id`);
      return;
    }
    if (map.has(item.id)) issues.push(`${name} has duplicate id: ${item.id}`);
    map.set(item.id, item);
  });
  return map;
}

function requireFields(name, item, fields, issues) {
  fields.forEach((field) => {
    if (item[field] === undefined || item[field] === null || item[field] === "") {
      issues.push(`${name} ${item.id || "(missing id)"} is missing ${field}`);
    }
  });
}

function checkRef(label, value, map, issues) {
  if (!map.has(value)) issues.push(`${label} references missing id: ${value}`);
}

function main() {
  const issues = [];
  const groups = indexById("groups", readJSON("groups.json"), issues);
  const tests = indexById("tests", readJSON("tests.json"), issues);
  const skills = indexById("skills", readJSON("skills.json"), issues);
  const subjects = indexById("subjects", readJSON("subjects.json"), issues);
  const topics = indexById("topics", readJSON("topics.json"), issues);
  const questions = indexById("questions", readJSON("questions.json"), issues);
  const mocks = indexById("mocks", readJSON("mocks.json"), issues);

  topics.forEach((topic) => {
    requireFields("topic", topic, ["name", "skillId", "subjectId", "description"], issues);
    checkRef(`topic ${topic.id} skillId`, topic.skillId, skills, issues);
    checkRef(`topic ${topic.id} subjectId`, topic.subjectId, subjects, issues);
  });

  tests.forEach((test) => {
    requireFields("test", test, ["name", "groupId", "description"], issues);
    checkRef(`test ${test.id} groupId`, test.groupId, groups, issues);
  });

  questions.forEach((question) => {
    requireFields("question", question, [
      "testIds",
      "skillId",
      "subjectId",
      "topicId",
      "difficulty",
      "examStyle",
      "stem",
      "options",
      "answerIndex",
      "explanation",
      "urduExplanation"
    ], issues);

    if (!Array.isArray(question.testIds) || !question.testIds.length) {
      issues.push(`question ${question.id} must have a non-empty testIds array`);
    } else {
      question.testIds.forEach((testId) => checkRef(`question ${question.id} testIds`, testId, tests, issues));
    }

    checkRef(`question ${question.id} skillId`, question.skillId, skills, issues);
    checkRef(`question ${question.id} subjectId`, question.subjectId, subjects, issues);
    checkRef(`question ${question.id} topicId`, question.topicId, topics, issues);

    if (!Array.isArray(question.options) || question.options.length < 2) {
      issues.push(`question ${question.id} must have at least 2 options`);
    } else if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex >= question.options.length) {
      issues.push(`question ${question.id} has invalid answerIndex`);
    }
  });

  mocks.forEach((mock) => {
    requireFields("mock", mock, ["title", "testId", "durationMinutes", "questionIds", "instructions"], issues);
    checkRef(`mock ${mock.id} testId`, mock.testId, tests, issues);
    if (!Array.isArray(mock.questionIds) || !mock.questionIds.length) {
      issues.push(`mock ${mock.id} must have a non-empty questionIds array`);
    } else {
      mock.questionIds.forEach((questionId) => checkRef(`mock ${mock.id} questionIds`, questionId, questions, issues));
    }
  });

  if (issues.length) {
    console.error(issues.join("\n"));
    process.exit(1);
  }

  console.log(`Data validation OK: ${tests.size} tests, ${skills.size} skills, ${subjects.size} subjects, ${topics.size} topics, ${questions.size} questions, ${mocks.size} mocks.`);
}

main();
