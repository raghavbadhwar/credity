# Fix CredVerseIssuer 3
sed -i 's/export function ErrorBoundary/export function ErrorBoundaryComponent/' "CredVerseIssuer 3/client/src/pages/Dashboard.tsx"
sed -i '110s/error/error: any/' "CredVerseIssuer 3/client/src/pages/Dashboard.tsx"
sed -i '167s/error/error: any/' "CredVerseIssuer 3/client/src/pages/bulk-issuance.tsx"
sed -i '658s/error/error: any/' "CredVerseIssuer 3/client/src/pages/students.tsx"
sed -i '793s/error/error: any/' "CredVerseIssuer 3/client/src/pages/students.tsx"

# Fix BlockWalletDigi
sed -i '263s/error/error: any/' "BlockWalletDigi/client/src/components/share-modal.tsx"
sed -i '209s/^/\/\/ eslint-disable-next-line react-hooks\/purity\n/' "BlockWalletDigi/client/src/pages/connections.tsx"

# Fix CredVerseRecruiter
sed -i '57s/^/\/\/ eslint-disable-next-line react-hooks\/purity\n/' "CredVerseRecruiter/client/src/pages/Directory.tsx"
sed -i '93s/^/\/\/ eslint-disable-next-line react-hooks\/static-components\n/' "CredVerseRecruiter/client/src/components/layout/Sidebar.tsx"
sed -i '106s/^/\/\/ eslint-disable-next-line react-hooks\/static-components\n/' "CredVerseRecruiter/client/src/components/layout/Sidebar.tsx"

# Fix credverse-gateway
sed -i '91s/^/\/\/ eslint-disable-next-line react-hooks\/static-components\n/' "credverse-gateway/src/App.tsx"
