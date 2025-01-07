# ChatGenius: Smarter Workplace Communication with AI

## Background and Context
Chat apps, such as Slack, are a foundational element of the modern workplace. If you work remotely, they are the workplace - and even if you work in-person, chat apps enable asynchronous collaboration and integration with other common tools.

But chat apps aren't perfect - written text lacks the nuance of the voice and facial expressions. Chatting can be less engaging, or even less accurate, with people missing key pieces of information.

ChatGenius tackles this by applying generative AI, not to replace humans but to augment them. It gives the user a professional digital twin, an AI avatar that can represent them but still have a personal touch.

## Submission Guidelines
At the end of each week you'll be required to submit the following to the GauntletAI Platform:

- A link to the code of the project in Github
- The Brainlift you used in learning to build the application (and anything you used to feed to a model to make building the application better)
- A 5 minute walkthrough of you showing the world what you've built (and where relevant, how you've built it)
- The link to you sharing this project on X, and interacting with any feedback

## Project Timeline

### Baseline App (Week 1)
Our first week is spent building the application itself using AI-first principles. Some topics and techniques have not yet been covered in class, but you are not prevented from using them.

For a baseline reference app, consider Slack - it is the dominant tool in this space, providing excellent UX and integration with a rich ecosystem.

#### Core Features
- [x] Authentication
  - User registration with email verification
  - Secure login with JWT tokens
  - Session management
  - Protected routes
  - User profiles
- [ ] Real-time messaging
- [ ] Channel/DM organization
- [ ] File sharing & search
- [ ] User presence & status
- [ ] Thread support
- [ ] Emoji reactions

*Note: IDEs such as Cursor and any other AI tools are all fair game, as well as building on related open source projects (though doublecheck that the license is compatible with potential commercial use).*

### AI Objectives (Week 2)
Once you've built the app itself, it's time to add AI! The high-level goal is an AI avatar that represents users in conversations and meetings.

#### Baseline Functionality
- Given a prompt, can create and send communication on behalf of the user
- Communication should be informed by content on the Slack (context-aware)
- Should mirror the personality of the user ("sound" like them)
- Avatar can receive and respond to questions automatically without user intervention

#### Advanced Features
- **Voice synthesis**: Deliver messages via synthesized voice
- **Video synthesis**: Deliver messages via synthesized video / visual avatar
- **Avatar customization**:
  - Match user appearance (upload voice/pictures/video)
  - Select from custom options
- **Gesture/expression generation**: Enable more sophisticated expression

## AI Tools and Techniques

### Key Technologies
1. **Prompt Engineering**
   - OpenAI API
   - Iterative prompt refinement

2. **Prompt Templates**
   - LangChain integration
   - Real-world information incorporation

3. **Retrieval Augmented Generation (RAG)**
   - Enhanced AI apps with relevant content access
   - Large corpus integration

4. **Fine Tuning**
   - OpenAI Platform
   - Custom behavior based on user data

### Recommended Services
- **Avatar Creation**: D-ID, HeyGen
- **AI Observability**: Langfuse (for monitoring and debugging)

## Scope and Deliverables

### Main Deliverables
| Deliverable | Description |
|-------------|-------------|
| Chat app | Working chat web app with real-time messaging between users in channels |
| AI augmentation (baseline) | Virtual avatar creation based on chat history |
| AI augmentation (stretch) | Enhanced avatar features (audio/video, expression, context) |

### Project Milestones
| Date | Phase | Description |
|------|-------|-------------|
| Jan 7, 2025 | Chat app MVP | Working chat app with messaging and channel functionality |
| Jan 8, 2025 | Check in 1 | Initial progress review |
| Jan 10, 2025 | App complete | Final app delivery |
| Jan 13, 2025 | AI Objectives start | Begin AI integration |
| Jan 15, 2025 | Check in 2 | AI progress review |
| Jan 17, 2025 | AI features complete | Final AI features delivery |

## Resources
- [Mattermost](https://mattermost.com/) - an open-source Slack alternative
- [LangChain](https://www.langchain.com/) - framework for AI-powered applications

## Suggested Development Steps
1. Plan initial approach, ensure AI development tools are set up
2. Get MVP functionality working
3. Iterate on MVP until it hits acceptable baseline of features
4. Select AI augmentation(s)
5. Implement AI augmentations, with focus on rapid runnable MVP to get feedback and tight iteration loop

*Note: You're encouraged to share your progress as you go, both for camaraderie and competition. You can also ask questions in Slack any time.*