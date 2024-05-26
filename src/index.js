#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SNAPSHOTS_DIR = '__snapshots__';

function hashString(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function getSnapshotPath(testName) {
  const hash = hashString(testName);
  return path.join(SNAPSHOTS_DIR, `${hash}.snap`);
}

function saveSnapshot(testName, data) {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR);
  }
  const snapshotPath = getSnapshotPath(testName);
  fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Snapshot saved for test: ${testName}`);
}

function readSnapshot(testName) {
  const snapshotPath = getSnapshotPath(testName);
  if (!fs.existsSync(snapshotPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
}

function compareSnapshots(testName, newData) {
  const oldData = readSnapshot(testName);
  if (!oldData) {
    saveSnapshot(testName, newData);
    return { passed: true, message: `New snapshot created for test: ${testName}` };
  }
  const isEqual = JSON.stringify(oldData) === JSON.stringify(newData);
  if (!isEqual) {
    return { passed: false, message: `Snapshot mismatch for test: ${testName}` };
  }
  return { passed: true, message: `Snapshot matched for test: ${testName}` };
}

function snapshotTest(testName, testFn) {
  const newData = testFn();
  const result = compareSnapshots(testName, newData);
  if (result.passed) {
    console.log(`✅ ${result.message}`);
  } else {
    console.error(`❌ ${result.message}`);
    process.exit(1);
  }
}

// Example usage
if (require.main === module) {
  const [,, testName] = process.argv;
  if (!testName) {
    console.error('Please provide a test name as an argument.');
    process.exit(1);
  }

  // Replace this with the actual test function
  const exampleTestFunction = () => ({ foo: 'bar', timestamp: Date.now() });

  snapshotTest(testName, exampleTestFunction);
}

module.exports = {
  snapshotTest,
};
