# Swiss Testing Night 2025 - GitHub Copilot for QA Workshop

This repository contains materials and examples for the hands-on workshop at Swiss Testing Night 2025, focused on leveraging GitHub Copilot for Quality Assurance applications.

## Event Context

This workshop is part of the Swiss Testing Night 2025, taking place on September 16, 2025, at Xebia Switzerland, Zurich. It's designed as a 30-minute hands-on session to demonstrate practical applications of AI in software testing.

## About GitHub Copilot

GitHub Copilot is an AI-powered code completion tool that helps developers write code faster and with fewer errors. It uses OpenAI's language models trained on public code repositories to suggest code snippets, complete functions, and even generate entire classes based on comments or context.

### Pricing Model
- Free for verified students, teachers, and maintainers of popular open source projects
- Individual: $10/month or $100/year
- Business: $19/user/month (includes advanced security and policy controls)
- Enterprise: Custom pricing with additional features

## Workshop Topics

### Core Applications of GitHub Copilot in QA

1. **AI-Powered Test Analysis**
   - LLM as a testing judge
   - Bias detection and testing
   - Automated bug detection and root cause analysis

2. **Manual Testing Enhancement**
   - Test case generation
   - Test data mapping
   - Exploratory testing assistance

3. **Automated Testing**
   - AI code suggestions for test automation
   - Code coverage optimization
   - Test data generation
   - API testing with Postman/RestSharp

4. **Quality Process Optimization**
   - Automated bug tracking and reporting
   - Log analysis and pattern detection
   - Code review automation
   - Test traceability management

5. **Persona-Based Testing**
   - Role-specific testing perspectives:
     - Test Automation Engineer
     - Test Analyst
     - Site Reliability Engineer
     - Business Analyst
     - And more...

## Hands-on Workshop: UI Testing with Playwright & MCP

In this workshop, we'll focus on practical UI testing using Playwright with the Model Context Protocol (MCP) server. This combination allows for powerful browser automation with AI assistance.

### Setup and Prerequisites (TBD)
- Node.js installation
- GitHub Copilot subscription
- VS Code with GitHub Copilot extension
- Basic JavaScript/TypeScript knowledge

## Workshop Test Environment Setup

### Demo Applications for Testing

1. **Primary Testing Target: Sauce Demo**
   - Website: https://www.saucedemo.com/
   - Features to test:
     - Login authentication
     - Product catalog navigation
     - Shopping cart operations
     - Checkout process
     - Sort and filter functionality
   - Benefits:
     - Stable and well-maintained
     - Common e-commerce scenarios
     - Built-in test accounts
     - Consistent test data

2. **Alternative Testing Targets**
   - [DemoQA](https://demoqa.com/)
     - Rich set of UI components
     - Form validations
     - Modals and alerts
     - Drag and drop interfaces
   - [The Internet by Sauce Labs](http://the-internet.herokuapp.com/)
     - Various UI elements and scenarios
     - Authentication tests
     - Dynamic loading
     - File upload/download
   - [ParaBank](https://parabank.parasoft.com/)
     - Banking application scenarios
     - Account management
     - Fund transfers
     - Bill pay features

### Test Setup Considerations

1. **Technical Requirements**
   - Node.js and npm installation
   - Playwright installation
   - MCP server setup
   - GitHub Copilot extension
   - VS Code editor

2. **Test Structure**
   - Page Object Model implementation
   - Test data management
   - Custom commands and utilities
   - Reporting configuration

3. **Cross-browser Testing**
   - Chrome/Chromium
   - Firefox
   - WebKit (Safari)

4. **Test Scenarios Coverage**
   - Functional testing
   - Error handling
   - Performance metrics
   - Accessibility testing
   - Visual regression

## About Xebia

Xebia is a global IT consultancy and technology company that specializes in digital transformation with a strong focus on AI integration and quality assurance. As a pioneer in the AI era, Xebia brings extensive expertise in:

### AI and Quality Assurance Expertise
- AI-Native Engineering and Solutions
- Intelligent Automation at Scale
- Digital Core Modernization
- Quality Assurance and Testing Innovation

### Strategic Partnerships
- Microsoft Gold Partner
- GitHub Advanced Partner
- Leading partnerships with major cloud and technology providers

### Global Presence
- Operations in 16 countries
- Local expertise with global scale
- Deep domain knowledge across industries

### AI-First Approach
- Specialized in AI-driven automation
- Focus on responsible AI implementation
- AI-powered solutions and accelerators
- Continuous innovation in AI applications

### Training and Knowledge Sharing
- Active community engagement
- Regular workshops and events
- Thought leadership in AI and QA
- Open-source contributions

Xebia's commitment to being "knowledge-obsessed" and its extensive partnership ecosystem makes it an ideal organization to lead the discussion on integrating AI tools like GitHub Copilot into QA processes.

## Getting Started

**For Workshop Participants:** See [WORKSHOP-GUIDE.md](WORKSHOP-GUIDE.md) for quick setup and execution steps.

**For Workshop Facilitators:** Use [FACILITATION-GUIDE.md](FACILITATION-GUIDE.md) for running effective sessions.

**For Individual Learning:** Follow the detailed setup in [test-automation/docs/setup-guide.md](test-automation/docs/setup-guide.md).

## Documentation Structure

### Core Workshop Materials
- [WORKSHOP-GUIDE.md](WORKSHOP-GUIDE.md) - Quick start guide for participants
- [FACILITATION-GUIDE.md](FACILITATION-GUIDE.md) - Session management for facilitators
- [copilot-context/personas.md](copilot-context/personas.md) - Testing personas and review process

### Technical Documentation  
- [test-automation/docs/test-strategy.md](test-automation/docs/test-strategy.md) - Testing approach and rationale
- [test-automation/docs/copilot-test-generation.md](test-automation/docs/copilot-test-generation.md) - AI-powered test creation guide
- [test-automation/docs/infrastructure.md](test-automation/docs/infrastructure.md) - CI/CD and deployment considerations
- [copilot-context/copilot-reflection.md](copilot-context/copilot-reflection.md) - Lessons learned and best practices

## Workshop Value Proposition

### For QA Professionals
- Learn practical AI integration in testing workflows
- Hands-on experience with modern testing tools
- Collaborative review processes using personas

### For Development Teams  
- Understand AI-powered test creation
- See maintainable test architecture in action
- Experience cross-functional quality approaches

### For Organizations
- Evaluate AI testing tools for adoption
- Understand ROI of AI-enhanced QA processes
- See practical implementation examples

## GitHub Copilot Usage Tips

### Accepting Suggestions
- **Tab or Right Arrow**: Accept the current suggestion
- **Ctrl+Enter**: See all suggestions in a separate panel
- **Alt+]**: See next suggestion
- **Alt+[**: See previous suggestion
- **Alt+\**: Toggle Copilot suggestions
- **Ctrl+/**: Accept word suggestion
- **Esc**: Dismiss current suggestion

### Best Practices
1. Use clear and descriptive comments to get better suggestions
2. Break down complex tasks into smaller, more manageable pieces
3. Review suggestions carefully before accepting them
4. Use Copilot to generate test cases and scenarios
5. Leverage Copilot for generating test data and edge cases

## References

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Playwright Documentation](https://playwright.dev/)
- [Model Context Protocol (MCP) Documentation](https://executeautomation.github.io/mcp-playwright/docs/intro)
- [Swiss Testing Night 2025](https://events.xebia.com/swiss-testing-night-2025)
- [Xebia](https://xebia.com/) - AI-First Global IT Consultancy
