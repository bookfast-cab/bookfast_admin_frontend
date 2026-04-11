import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

const PaymentRemarksDrawer = ({ open, onClose, row }) => {
    if (!row) return null;
    let parsedRemarks = {};
    try {
        parsedRemarks = typeof row.remarks === 'string'
            ? JSON.parse(row.remarks)
            : row.remarks;
    } catch (e) {
        parsedRemarks = null;
    }
    
    return (
        <Drawer anchor="right" open={open} onClose={() => onClose(false)}>
            <Box sx={{ width: 400, p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Remarks for Order #{row.orderId}
                    </Typography>
                    <IconButton onClick={() => onClose(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                    Status: {row.status}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                    Amount: ₹{row.amount}
                </Typography>

                <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, color: '#ff5722' }}
                    color="primary" // or "error", "success", "text.secondary", etc.
                    gutterBottom
                >
                    What does Razorpay say?
                </Typography>


                <Box
                    sx={{
                        bgcolor: '#f5f5f5',
                        p: 2,
                        borderRadius: 2,
                        minHeight: 150,
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.875rem',
                    }}
                >
                    {parsedRemarks ? (
                        <ReactJson
                            src={parsedRemarks}
                            name={false}
                            theme="rjv-default"
                            collapsed={false}
                            enableClipboard={true}
                            displayDataTypes={false}
                            style={{ fontSize: '14px' }}
                        />
                    ) : (
                        'Invalid or no remarks available.'
                    )}
                </Box>

            </Box>
        </Drawer>
    );
};

export default PaymentRemarksDrawer;
