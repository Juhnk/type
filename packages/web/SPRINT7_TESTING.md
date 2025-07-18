# Sprint 7: Difficulty Mode Testing Guide

## Overview

Sprint 7 implements Expert and Master difficulty modes with enhanced validation logic:

- **Normal Mode**: Unlimited corrections allowed (existing behavior)
- **Expert Mode**: Game fails when user submits a word (presses space) that contains incorrect characters
- **Master Mode**: Game fails immediately on the first incorrect keystroke

## Testing Scenarios

### 1. Normal Mode Testing

**Expected Behavior**: No changes from previous implementation

- User can make mistakes and continue typing
- Backspace corrections are allowed
- Game completes normally regardless of errors

**Test Steps**:

1. Set difficulty to "Normal"
2. Start any test mode (time/words)
3. Intentionally make typing errors
4. Use backspace to correct errors
5. Continue typing and complete the test
6. Verify game completes successfully with accuracy calculations

### 2. Expert Mode Testing

#### 2.1 Success Case - No Errors in Words

**Test Steps**:

1. Set difficulty to "Expert"
2. Start a words test with 10 words
3. Type each word correctly
4. Press space after each correct word
5. Complete all words without errors
6. Verify game completes successfully

#### 2.2 Failure Case - Error in Word Submission

**Test Steps**:

1. Set difficulty to "Expert"
2. Start a test
3. Type the first word correctly
4. On the second word, make an intentional error (e.g., type "wrng" instead of "wrong")
5. Press space to submit the incorrect word
6. **Expected Result**: Game should fail immediately with message: "Expert Mode: Failed due to errors in word 'wrng'"

#### 2.3 Edge Case - Errors with Backspace Correction

**Test Steps**:

1. Set difficulty to "Expert"
2. Start typing a word
3. Make an error mid-word
4. Use backspace to correct the error
5. Complete the word correctly
6. Press space
7. **Expected Result**: Game should continue (word was corrected before submission)

#### 2.4 Edge Case - Multiple Errors in One Word

**Test Steps**:

1. Set difficulty to "Expert"
2. Type a word with multiple errors (e.g., "helo" instead of "hello")
3. Press space
4. **Expected Result**: Game fails with the incorrect word shown in error message

### 3. Master Mode Testing

#### 3.1 Success Case - Perfect Typing

**Test Steps**:

1. Set difficulty to "Master"
2. Start any test
3. Type perfectly without any mistakes
4. Complete the entire test
5. **Expected Result**: Game completes successfully

#### 3.2 Failure Case - First Incorrect Keystroke

**Test Steps**:

1. Set difficulty to "Master"
2. Start typing
3. On any character, press the wrong key (e.g., press 'x' when 'a' is expected)
4. **Expected Result**: Game fails immediately with message: "Master Mode: Failed on incorrect keystroke 'x' (expected 'a')"

#### 3.3 Edge Case - Failure on Different Character Types

**Test Steps**:

1. Test failure on letters: type 'b' when 'a' expected
2. Test failure on numbers: type '2' when '1' expected
3. Test failure on punctuation: type '!' when '.' expected
4. Test failure on spaces: type any letter when space expected
5. **Expected Result**: All should trigger immediate failure with appropriate error messages

### 4. Mode Switching Tests

#### 4.1 Switch Between Difficulty Modes

**Test Steps**:

1. Start a test in Normal mode
2. Reset the game
3. Change to Expert mode
4. Start new test and verify Expert mode behavior
5. Reset and change to Master mode
6. Verify Master mode behavior
7. **Expected Result**: Mode changes should be applied correctly

#### 4.2 Failure State Reset

**Test Steps**:

1. Fail a test in Expert or Master mode
2. Click "Try Again" button
3. Start a new test
4. **Expected Result**: Failure state should be cleared, new test should work normally

### 5. UI/UX Testing

#### 5.1 Failure Message Display

**Test Steps**:

1. Trigger failure in Expert mode
2. Verify ResultsCard shows:
   - Red AlertTriangle icon instead of Trophy
   - "Test Failed!" title instead of "Test Complete!"
   - "Test Failed in Expert Mode" message
   - Red box with specific failure reason
3. Repeat for Master mode
4. **Expected Result**: Failure UI should be clearly visible and informative

#### 5.2 Stats on Failure

**Test Steps**:

1. Type for a few seconds then trigger a failure
2. Check that stats (WPM, accuracy, characters) reflect actual progress before failure
3. **Expected Result**: Stats should show progress up to the point of failure

### 6. Cross-Mode Testing

#### 6.1 Expert Mode in Different Test Modes

**Test Steps**:

1. Test Expert mode in Words mode (10, 25, 50, 100 words)
2. Test Expert mode in Time mode (15s, 30s, 60s, 120s)
3. **Expected Result**: Expert validation should work consistently across all modes

#### 6.2 Master Mode in Different Test Modes

**Test Steps**:

1. Test Master mode in Words mode
2. Test Master mode in Time mode
3. **Expected Result**: Master validation should work consistently across all modes

### 7. Edge Cases and Error Handling

#### 7.1 Backspace Behavior in Difficulty Modes

**Test Steps**:

1. In Expert mode: Make error, backspace, continue typing
2. In Master mode: Verify backspace works for correct characters
3. **Expected Result**: Backspace should work normally when not violating difficulty rules

#### 7.2 Special Characters and Punctuation

**Test Steps**:

1. Test difficulty modes with punctuation enabled
2. Verify validation works with special characters (@, #, etc.)
3. **Expected Result**: Validation should work correctly with all character types

## Implementation Verification

### Code Changes Made:

1. ✅ Added `testFailed` and `failureReason` fields to GameState
2. ✅ Enhanced `handleKeyPress` with Expert mode word-level validation
3. ✅ Enhanced `handleKeyPress` with Master mode character-level validation
4. ✅ Updated `resetGame` to clear failure state
5. ✅ Modified `ResultsCard` to display failure messages with appropriate UI
6. ✅ Added proper failure reason messages for both difficulty modes

### Files Modified:

- `src/store/useGameStore.ts`: Core difficulty logic implementation
- `src/components/game/ResultsCard.tsx`: Failure message UI

## Success Criteria

- ✅ All Normal mode functionality preserved
- ✅ Expert mode fails on incorrect word submission (space after errors)
- ✅ Master mode fails on first incorrect keystroke
- ✅ Failure messages clearly explain what went wrong
- ✅ UI appropriately reflects failure state
- ✅ Failure state resets properly when starting new test
- ✅ TypeScript compilation successful
- ✅ Difficulty validation works across all test modes (time/words)
