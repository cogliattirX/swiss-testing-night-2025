# Structured AI Development Workflow 🔄

*Inspired by Emanuele Bartolesi's persona-based approach for systematic AI-assisted development*

## Overview

This workflow transforms chaotic AI interactions into a structured development process that mirrors real software teams. Instead of expecting one AI to do everything, we work with specialized AI personas through defined stages.

## The Four-Stage Development Process

### Stage 1: Requirements Gathering 📋
**Persona**: QA Product Manager  
**Input**: Feature ideas or testing needs  
**Output**: Quality Requirement Document (QRD)  
**File**: `docs/[feature-name]-qrd.md`

#### Process
1. Switch to **QA Product Manager** chat mode
2. Describe the testing need or quality concern
3. AI generates structured QRD with:
   - Feature summary and quality goals
   - User scenarios requiring validation  
   - Acceptance criteria for each scenario
   - Quality gates and success metrics
   - Risk assessment and edge cases

#### Example Input
```
"We need to test the checkout process for any e-commerce website, 
not just Sauce Demo, to provide quality assessment for workshop participants."
```

#### Example Output Structure
```markdown
# Universal Checkout Testing - QRD

## Feature Summary
Universal e-commerce checkout validation framework for any website...

## User Scenarios
1. As a QA engineer, I can test any e-commerce checkout flow...
2. As a workshop participant, I can see live checkout testing...

## Acceptance Criteria
- [ ] Framework detects checkout elements automatically
- [ ] Tests validate payment form security
- [ ] Reports include checkout completion rates
...
```

---

### Stage 2: Technical Design 🏗️
**Persona**: QA Test Architect  
**Input**: QRD from Stage 1  
**Output**: Test Strategy Document  
**File**: `docs/[feature-name]-test-strategy.md`

#### Process
1. Switch to **QA Test Architect** chat mode
2. Reference the QRD file created in Stage 1
3. AI generates technical implementation plan:
   - Test architecture and patterns
   - Step-by-step implementation guide
   - Integration points and dependencies
   - Tools and frameworks specification
   - No actual code - just the blueprint

#### Example Input
```
"Create a test strategy for the Universal Checkout Testing QRD, 
focusing on our Playwright + TypeScript framework with 30-minute workshop constraints."
```

#### Example Output Structure
```markdown
# Universal Checkout Testing - Test Strategy

## Architecture Overview
Page Object Model with dynamic element detection...

## Implementation Steps
1. Create CheckoutDetector utility class
2. Implement CheckoutPageObject with generic patterns
3. Build CheckoutValidator with security checks
4. Integrate with QualityReporter for scoring
...

## Workshop Integration
- Execution timing: 1200ms delays for educational visibility
- Live demonstration: audience URL → checkout detection → validation
...
```

---

### Stage 3: Implementation 👨‍💻
**Persona**: Test Implementation Engineer  
**Input**: Test Strategy from Stage 2  
**Output**: Working test code  
**Files**: Test files, page objects, utilities

#### Process
1. Switch to **Test Implementation Engineer** chat mode  
2. Reference both QRD and Test Strategy documents
3. AI implements following the blueprint exactly:
   - Follows established patterns and standards
   - Uses proper TypeScript and Playwright practices
   - Includes observability for workshop demonstrations
   - Adds comprehensive error handling

#### Example Input
```
"Implement the Universal Checkout Testing strategy step by step, 
ensuring all steps from the test strategy document are completed."
```

#### Example Output
- `tests/websites/generic/checkout-universal.spec.ts`
- `lib/page-objects/CheckoutPageObject.ts`
- `lib/utilities/CheckoutDetector.ts`
- `lib/validators/CheckoutValidator.ts`

---

### Stage 4: Quality Assurance 🔍
**Persona**: QA Implementation Reviewer  
**Input**: Implemented code from Stage 3  
**Output**: Quality audit report  
**File**: `docs/[feature-name]-review.md`

#### Process
1. Switch to **QA Implementation Reviewer** chat mode
2. AI audits implementation against QRD and Test Strategy:
   - Compliance validation
   - Code quality assessment
   - Workshop readiness evaluation
   - Gap identification and prioritization

#### Example Input
```
"Review the Universal Checkout Testing implementation against 
the QRD and test strategy, focusing on workshop demonstration readiness."
```

#### Example Output Structure
```markdown
# Universal Checkout Testing - Implementation Review

## Summary
Implementation achieves 95% compliance with requirements. 
Ready for workshop demonstration with minor adjustments.

## Compliance Matrix
| Requirement | Status | Evidence |
|------------|--------|----------|
| Auto-detection | ✅ Compliant | CheckoutDetector.ts:15-45 |
| Security validation | ⚠️ Partial | Missing HTTPS verification |
...

## Findings
### High Priority
- **Missing HTTPS Validation**: Security requirement not implemented
- **Workshop Timing**: Needs observability calls for 1200ms mode
...
```

---

## Special Personas for Complex Issues

### 🐺 Mr. Wolf (Problem Solver)
**When to Use**: Tests failing, complex bugs, workshop demo issues  
**Approach**: Immediate problem analysis and solution  

```
"The universal checkout test is failing on websites with shadow DOM. 
Fix this for reliable workshop demonstrations."
```

### 🔒 Security Testing Specialist  
**When to Use**: Security-focused requirements or reviews  
**Approach**: OWASP compliance, secure testing practices

### ♿ Accessibility Testing Expert
**When to Use**: WCAG compliance, inclusive design validation  
**Approach**: Automated accessibility testing integration

### 📊 Performance Testing Engineer
**When to Use**: Performance requirements, optimization needs  
**Approach**: Core Web Vitals, loading optimization

### 🎓 QA Workshop Facilitator
**When to Use**: Workshop preparation, demonstration optimization  
**Approach**: Educational design, audience engagement

---

## Workflow Benefits

### 1. **Structured Development**
- Clear phases prevent AI from jumping around
- Each persona has specific responsibilities
- Quality gates built into the process

### 2. **Consistent Quality**
- Requirements always documented
- Technical design before implementation
- Mandatory review process

### 3. **Workshop Optimization**
- Every persona understands 30-minute constraint
- Educational value built into all stages
- Demonstration readiness validation

### 4. **Maintainable Documentation**
- Complete paper trail from idea to implementation
- Easy onboarding for new team members
- Knowledge preservation across sessions

### 5. **Scalable Complexity**
- Simple features: PM → Architect → Engineer
- Complex features: Add specialized personas and reviewers
- Critical features: Multiple review cycles

---

## Best Practices

### Always Include Context
Every prompt should reference:
- Project: Swiss Testing Night 2025
- Framework: Playwright + TypeScript + Universal Testing
- Constraint: 30-minute workshop demonstration
- Goal: Professional quality assessment for any website

### Use the Right Persona
- **Don't** ask Test Engineer to design architecture
- **Do** use QA Architect for technical design
- **Don't** ask Product Manager to debug code
- **Do** use Mr. Wolf for problem-solving

### Reference Previous Work
- QA Architect references QRD
- Test Engineer references both QRD and Test Strategy  
- QA Reviewer validates against all previous documents

### Validate Workshop Readiness
Every stage should consider:
- 30-minute demonstration window
- Mixed technical audience
- Live website testing scenarios
- Professional quality reporting
- Immediate business value

---

## Example: Complete Workflow

### 1. Requirements (PM)
```
"Create universal form validation testing for workshop demonstrations."
```
→ `docs/form-validation-qrd.md`

### 2. Design (Architect)  
```
"Design test strategy for form-validation-qrd.md using our Playwright framework."
```
→ `docs/form-validation-test-strategy.md`

### 3. Implementation (Engineer)
```
"Implement form-validation-test-strategy.md step by step."
```
→ Working test code

### 4. Review (Reviewer)
```
"Audit form validation implementation against QRD and test strategy."
```
→ `docs/form-validation-review.md`

### 5. Debug (Mr. Wolf - if needed)
```
"Form validation test fails on React forms. Fix for workshop reliability."
```
→ Updated implementation

This structured approach ensures every AI-generated feature is well-designed, properly implemented, thoroughly reviewed, and workshop-ready! 🎯
