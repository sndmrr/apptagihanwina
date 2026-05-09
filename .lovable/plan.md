

## Plan: Split DepositDateCard into Two Sections

### Overview
Modify the DepositDateCard to have two sections within one card:
- **Top section**: Tanggal Setor status (existing)
- **Bottom section**: Warning/alert showing count of unique customer names with active unpaid bills (tagihan aktif), with red notification styling

### Changes

#### 1. Update `DepositDateCard.tsx`
- Add new prop `jumlahNamaTagihan: number` (count of unique names with active bills)
- Split the card into two visual sections with a divider
- Top: Keep existing deposit date display
- Bottom: Add red warning section showing "Tagihan harus segera dibayar: X nama" with `AlertTriangle` icon
- Red/warning styling for the bottom section when count > 0

#### 2. Update `MitraDashboard.tsx`
- Pass `jumlahNamaTagihan={groupedTagihanAktif.length}` to `DepositDateCard`
- `groupedTagihanAktif` already contains unique customer name groups, so `.length` gives the count of unique names with active bills

#### 3. Update `AdminDashboard.tsx` (if it uses DepositDateCard)
- Pass the same prop if the card is used there too

### Technical Details
- The `groupedTagihanAktif` array already groups by unique customer name, so its `.length` = number of unique names with unpaid bills
- Bottom section will use red/rose gradient text and pulsing dot indicator when count > 0
- When count is 0, show a green "Semua lunas" message instead

