import { Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { formatPrice } from '../utils/helpers'

// Sort/filter stay in useFlights; table is display-only for this list.
const COLUMNS = [
  { field: 'airline', headerName: 'Airline', flex: 1, minWidth: 90 },
  { field: 'departureTime', headerName: 'Depart', width: 80 },
  { field: 'arrivalTime', headerName: 'Arrive', width: 80 },
  { field: 'duration', headerName: 'Duration', width: 100 },
  {
    field: 'stops',
    headerName: 'Stops',
    width: 100,
    valueFormatter: (value) =>
      value === 0 ? 'Nonstop' : value === 1 ? '1 stop' : `${value} stops`,
  },
  {
    field: 'price',
    headerName: 'Price',
    width: 100,
    sortable: false,
    valueFormatter: (value) =>
      typeof value === 'string' ? value : formatPrice(value),
  },
]

export default function FlightsTable({ rows }) {
  return (
    <Box
      sx={{
        minHeight: 300,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(11,34,57,0.12)',
        overflow: 'hidden',
        '& .MuiDataGrid-root': {
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderColor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(11,34,57,0.08)',
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(11,34,57,0.04)',
            borderColor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(11,34,57,0.10)',
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(11,34,57,0.03)',
          },
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        disableColumnSorting
        disableRowSelectionOnClick
        hideFooter
        autoHeight
      />
    </Box>
  )
}
