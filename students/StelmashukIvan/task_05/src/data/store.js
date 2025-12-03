const { randomUUID } = require('crypto');

class DataStore {
  constructor() {
    this.groups = new Map();
    this.assignments = new Map();
    this.initializeSampleData();
  }

  initializeSampleData() {
    const group1 = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'CS-101',
      course: 1,
      faculty: 'Computer Science',
      studentCount: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const group2 = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'MATH-201',
      course: 2,
      faculty: 'Mathematics',
      studentCount: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.groups.set(group1.id, group1);
    this.groups.set(group2.id, group2);

    // Sample assignments
    const assignment1 = {
      id: '660e8400-e29b-41d4-a716-446655440000',
      title: 'Introduction to Algorithms',
      description: 'Basic sorting algorithms implementation',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: 100,
      groupId: group1.id,
      subject: 'Algorithms',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.assignments.set(assignment1.id, assignment1);
  }

  // Group methods
  getAllGroups() {
    return Array.from(this.groups.values());
  }

  getGroupById(id) {
    return this.groups.get(id);
  }

  createGroup(groupData) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const group = {
      id,
      ...groupData,
      createdAt: now,
      updatedAt: now
    };
    this.groups.set(id, group);
    return group;
  }

  updateGroup(id, updateData) {
    const group = this.groups.get(id);
    if (!group) return null;

    const updatedGroup = {
      ...group,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  deleteGroup(id) {
    return this.groups.delete(id);
  }

  getAllAssignments() {
    return Array.from(this.assignments.values());
  }

  getAssignmentById(id) {
    return this.assignments.get(id);
  }

  createAssignment(assignmentData) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const assignment = {
      id,
      ...assignmentData,
      createdAt: now,
      updatedAt: now
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  updateAssignment(id, updateData) {
    const assignment = this.assignments.get(id);
    if (!assignment) return null;

    const updatedAssignment = {
      ...assignment,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  deleteAssignment(id) {
    return this.assignments.delete(id);
  }

  getAssignmentsByGroup(groupId) {
    return this.getAllAssignments().filter(assignment => assignment.groupId === groupId);
  }
}

module.exports = new DataStore();