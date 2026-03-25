# Right Navigation to Parent's Next Sibling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When navigating RIGHT at a node that is the last child of its parent and has no children, navigate to the parent's next sibling instead of doing nothing.

**Architecture:** Extend the "right" navigation logic in `findNextActiveNodeOnKeyboardNavigation` to check if a node is the last child of its parent with no children, and if so, navigate to the parent's next sibling.

**Tech Stack:** TypeScript, Vitest

---

## Context

Currently, pressing RIGHT (`L`) at a node:
1. Finds the child group where `parentId === currentNode`
2. If found, navigates to the first node of that child group
3. If no child group exists (node has no children), nothing happens

**Desired behavior:** When a node has no children AND is the last child of its parent, pressing RIGHT should navigate to the parent's next sibling.

**Example:**
```
1.1
  1.1.1
  1.1.2  ← (last child, no children)
1.2      ← (parent's next sibling)
  1.2.1
```

Pressing RIGHT at 1.1.2 (no children, last child) should navigate to 1.2.

---

## Task 1: Add Failing Test for Right Navigation from Last Child

**File:** `src/lib/tree-utils/find/find-next-active-node-on-keyboard-navigation.spec.ts`

**Step 1: Add test case**

```typescript
describe('right navigation from last child without children', () => {
    const c0 = 'c0';
    const c1 = 'c1';
    const root = 'root';
    const n1 = 'n1';
    const n1_1 = 'n1_1';
    const n1_2 = 'n1_2';  // Last child of n1, no children
    const n2 = 'n2';  // Next sibling of n1
    const n2_1 = 'n2_1';
    const doc = {
        columns: [
            { id: c0, groups: [{ nodes: [n1, n2], parentId: root }] },
            {
                id: c1,
                groups: [
                    { nodes: [n1_1, n1_2], parentId: n1 },  // n1_2 is LAST child
                    { nodes: [n2_1], parentId: n2 },
                ],
            },
        ],
    };
    const gsEmpty: ActiveNodesOfColumn = {};

    it('should navigate to parent next sibling when last child has no children', () => {
        // n1_2 is last child of n1, and has no children
        // Pressing RIGHT should go to n2 (parent's next sibling)
        const result = findNext(doc.columns, n1_2, 'right', gsEmpty, null);
        expect(result).toEqual(n2);
    });

    it('should NOT trigger when node has children', () => {
        // Create a doc where n1_2 HAS children
        const docWithChildren = {
            columns: [
                { id: c0, groups: [{ nodes: [n1, n2], parentId: root }] },
                {
                    id: c1,
                    groups: [
                        { nodes: [n1_1, n1_2], parentId: n1 },
                        { nodes: [n2_1], parentId: n2 },
                    ],
                },
                {
                    id: c2,
                    groups: [
                        { nodes: ['n1_2_child'], parentId: n1_2 },  // n1_2 has children
                    ],
                },
            ],
        };
        // Pressing RIGHT should go to first child, not parent's sibling
        const result = findNext(docWithChildren.columns, n1_2, 'right', gsEmpty, null);
        expect(result).toEqual('n1_2_child');
    });

    it('should NOT trigger when node is NOT last child', () => {
        // n1_1 is NOT last child
        const result = findNext(doc.columns, n1_1, 'right', gsEmpty, null);
        expect(result).toEqual(null);  // n1_1 has no children
    });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/tree-utils/find/find-next-active-node-on-keyboard-navigation.spec.ts -- --grep "should navigate to parent next sibling"`

Expected: FAIL with assertion error (right navigation returns null instead of n2)

**Step 3: Commit**

```bash
git add src/lib/tree-utils/find/find-next-active-node-on-keyboard-navigation.spec.ts
git commit -m "test: add failing test for right navigation from last child"
```

---

## Task 2: Implement Right Navigation Fallback to Parent's Next Sibling

**File:** `src/lib/tree-utils/find/find-next-active-node-on-keyboard-navigation.ts`

**Step 1: Read and understand current right navigation logic**

Current code (lines 39-55):
```typescript
} else if (direction === 'right') {
    const group = findChildGroup(columns, node);
    if (group) {
        const columnIndex = findNodeColumn(columns, node);
        const nextColumn = columns[columnIndex + 1];
        if (!nextColumn) return;
        const activeNode = activeNodeOfGroup[nextColumn.id]?.[group.parentId];
        if (activeNode) nextNode = activeNode;
        else nextNode = group.nodes[0];
    }
    // commented out: else {
    //     const nextColumn = columns[columnIndex + 1];
    //     if (!nextColumn) return;
    //     nextNode = nextColumn.groups[0]?.nodes?.[0];
    // }
}
```

**Step 2: Add fallback logic when node has no children and is last child**

```typescript
} else if (direction === 'right') {
    const group = findChildGroup(columns, node);
    if (group) {
        const columnIndex = findNodeColumn(columns, node);
        const nextColumn = columns[columnIndex + 1];
        if (!nextColumn) return;
        const activeNode = activeNodeOfGroup[nextColumn.id]?.[group.parentId];
        if (activeNode) nextNode = activeNode;
        else nextNode = group.nodes[0];
    } else {
        // Node has no children - check if it's the last child of its parent
        // If so, navigate to parent's next sibling
        const nodeGroup = findGroupByNodeId(columns, node);
        if (nodeGroup && !nodeGroup.parentId.startsWith('r')) {
            const parentGroup = findGroupByNodeId(columns, nodeGroup.parentId);
            if (parentGroup) {
                const nodeIndex = parentGroup.nodes.indexOf(node);
                const isLastChild = nodeIndex === parentGroup.nodes.length - 1;
                if (isLastChild) {
                    // Navigate to parent's next sibling
                    const parentIndex = parentGroup.nodes.indexOf(nodeGroup.parentId);
                    const nextSiblingId = parentGroup.nodes[parentIndex + 1];
                    if (nextSiblingId) {
                        nextNode = nextSiblingId;
                    }
                }
            }
        }
    }
}
```

**Step 3: Run tests to verify they pass**

Run: `npm test -- src/lib/tree-utils/find/find-next-active-node-on-keyboard-navigation.spec.ts`

Expected: PASS

**Step 4: Commit**

```bash
git add src/lib/tree-utils/find/find-next-active-node-on-keyboard-navigation.ts
git commit -m "feat: right nav from last child goes to parent's next sibling"
```

---

## Task 3: Verify All Existing Tests Still Pass

**Step 1: Run full test suite**

Run: `npm test -- --run`

Expected: All tests pass (should be 437+ tests)

**Step 2: Commit if any test changes needed**

```bash
git add -A
git commit -m "test: update tests if needed"
```
