# Neural Map: Codebase Architecture for AI-Assisted Development

This document serves as a structural reference for AI agents and developers, reducing the need to read every file to understand the codebase.

## State Stores

- **useChatStore** (`client/store/useChatStore.ts`)
  - `chats`: Array of ChatSummary objects representing user conversations
  - `messagesMap`: Record mapping chat IDs to message arrays
  - `activeChatId`: Currently active chat identifier
  - `messages`: Key functions for chat management:
    - `loadChats()`: Load chats from SQLite database
    - `addContact()`: Add a new contact
    - `sendMessage()`: Send messages
    - `deleteChat()`: Delete chats

- **useSessionStore** (`client/store/useSessionStore.ts`)
  - `sessionEncryptionKey`: Encryption key for secure storage
  - `currentUserAlias`: Current user's display name

- **useThemeStore** (`client/store/useThemeStore.ts`)
  - Manages dark/light theme preferences

## Core Components

- **ChatList** (`client/components/chatList/ChatList.tsx`)
  - Displays list of chats with pinned, regular, and archived sections

- **ChatView** (`client/components/chatView/ChatView.tsx`)
  - View and interact with individual chat messages

- **MessageBubble** (`client/components/messageBubble/MessageBubble.tsx`)
  - Renders individual messages with appropriate styling

- **Settings** (`client/components/settings/Settings.tsx`)
  - User settings and configuration options

## Reusable UI Components

- **Button** (`client/components/ui/Button.tsx`)
  - Variants: primary, secondary, danger, ghost
  - Sizes: sm, md, lg
  - Emerald color scheme with dark theme

- **Card** (`client/components/ui/Card.tsx`)
  - Container component with dark background and emerald borders
  - Rounded corners with subtle shadowing

- **Modal** (`client/components/ui/Modal.tsx`)
  - Reusable modal with backdrop and framer-motion animations

## API / Utils

- **sqliteStore** (`client/lib/sqliteStore.ts`)
  - Local SQLite database for persistent storage
  - Manages chats, messages, and user data

- **relayClient** (`client/lib/relayClient.ts`)
  - WebSocket client for real-time communication
  - Handles message synchronization

- **crypto** (`client/lib/crypto.ts`)
  - Encryption utilities for secure data handling
  - Key generation and data encryption/decryption

## Key Functions

- **`sendMessage(chatId, message)`** (`useChatStore.ts`)
  - Send a message in a specific chat
  - Updates both local state and database

- **`addContact(alias, recipientPubKey)`** (`useChatStore.ts`)
  - Add a new contact to the chat list
  - Creates a new chat room

- **`deleteChat(chatId)`** (`useChatStore.ts`)
  - Delete a chat and all its messages
  - Cleans up local and remote data

- **`loadChats()`** (`useChatStore.ts`)
  - Load chats from SQLite database
  - Includes private notes

## Additional Notes

- All UI components follow atomic design principles
- Theme-aware styling with dark mode support
- Framer Motion used for smooth animations
- Accessible with proper ARIA attributes
- TypeScript enforced throughout

## Dependencies

- React with hooks
- TypeScript
- Tailwind CSS
- Framer Motion
- SQLite for local storage
- WebSocket for real-time updates
- Various crypto libraries for security