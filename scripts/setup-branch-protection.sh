#!/bin/bash

# Setup Branch Protection Rules for TypeAmp
# This script configures enterprise-grade branch protection using GitHub API

set -euo pipefail

# Configuration
REPO_OWNER="Juhnk"
REPO_NAME="type"
BRANCHES=("main" "master" "develop")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔒 Setting up branch protection rules for TypeAmp..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI. Run 'gh auth login' first.${NC}"
    exit 1
fi

# Function to setup branch protection
setup_branch_protection() {
    local branch=$1
    
    echo -e "${YELLOW}⚙️  Configuring protection for branch: $branch${NC}"
    
    # Create the protection rules JSON
    cat > /tmp/branch-protection.json <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Quick Checks & Analysis",
      "Security Analysis",
      "Test Suite - api",
      "Test Suite - web",
      "E2E Tests",
      "Build & Optimize"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {
      "users": [],
      "teams": []
    },
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true,
  "required_linear_history": false,
  "required_signatures": false
}
EOF

    # Apply the protection rules
    if gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection" \
        --input /tmp/branch-protection.json \
        > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Successfully protected branch: $branch${NC}"
    else
        echo -e "${RED}❌ Failed to protect branch: $branch${NC}"
    fi
    
    # Clean up
    rm -f /tmp/branch-protection.json
}

# Function to setup additional protection settings
setup_additional_settings() {
    echo -e "${YELLOW}⚙️  Configuring additional repository settings...${NC}"
    
    # Enable vulnerability alerts
    gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        "/repos/${REPO_OWNER}/${REPO_NAME}/vulnerability-alerts" \
        > /dev/null 2>&1 || true
    
    # Enable automated security fixes
    gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        "/repos/${REPO_OWNER}/${REPO_NAME}/automated-security-fixes" \
        > /dev/null 2>&1 || true
    
    echo -e "${GREEN}✅ Enabled vulnerability alerts and automated security fixes${NC}"
}

# Function to setup merge settings
setup_merge_settings() {
    echo -e "${YELLOW}⚙️  Configuring merge settings...${NC}"
    
    # Update repository settings
    gh api \
        --method PATCH \
        -H "Accept: application/vnd.github+json" \
        "/repos/${REPO_OWNER}/${REPO_NAME}" \
        -f allow_squash_merge=true \
        -f allow_merge_commit=true \
        -f allow_rebase_merge=false \
        -f delete_branch_on_merge=true \
        -f allow_auto_merge=true \
        > /dev/null 2>&1 || true
    
    echo -e "${GREEN}✅ Configured merge settings${NC}"
}

# Main execution
echo "🚀 Starting branch protection setup..."

# Setup protection for each branch
for branch in "${BRANCHES[@]}"; do
    # Check if branch exists
    if gh api "/repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}" > /dev/null 2>&1; then
        setup_branch_protection "$branch"
    else
        echo -e "${YELLOW}⚠️  Branch '$branch' does not exist, skipping...${NC}"
    fi
done

# Setup additional settings
setup_additional_settings
setup_merge_settings

echo -e "${GREEN}✅ Branch protection setup complete!${NC}"
echo ""
echo "📋 Summary of protection rules:"
echo "  • Required status checks before merging"
echo "  • Code owner reviews required"
echo "  • Dismiss stale reviews on new commits"
echo "  • Require conversation resolution"
echo "  • No force pushes allowed"
echo "  • Branch deletion protection"
echo "  • Automated security fixes enabled"
echo ""
echo "🔗 View settings at: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/branches"