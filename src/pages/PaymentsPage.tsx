import { useState, useEffect } from "react";
import { CreditCard, Download, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import { useSearchParams } from "react-router-dom";
import { toast } from "../store/useToastStore";

const PaymentsPage = () => {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axiosInstance.get("/payments/my");
        setPayments(res.data);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (searchParams.get("payment") === "success" && reference) {
      // Verify the payment with Paystack via the backend
      const verifyPayment = async () => {
        try {
          const res = await axiosInstance.get(`/payments/verify/${reference}`);
          if (res.data.status === "SUCCESS") {
            toast.success("🎉 Payment verified! Your certificate is now available.", 5000);
          } else if (res.data.status === "FAILED") {
            toast.error("Payment failed. Please try again.", 5000);
          } else {
            toast.success("Payment is being processed. Check back shortly.", 5000);
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.success("🎉 Payment received! Verification in progress.", 5000);
        } finally {
          // Re-fetch payments list to reflect the new payment status
          try {
            const res = await axiosInstance.get("/payments/my");
            setPayments(res.data);
          } catch (err) {
            console.error("Failed to refresh payments:", err);
          }
        }
      };
      verifyPayment();
      // Remove the query params to avoid re-triggering on refresh
      window.history.replaceState({}, "", window.location.pathname);
    } else if (searchParams.get("payment") === "success") {
      // Fallback if no reference in URL
      toast.success("🎉 Payment successful! Your certificate is now available.", 5000);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200";
      case "FAILED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-heading font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <CreditCard className="text-indigo-600" size={32} /> Payment History
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Track your transactions and download official receipts.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
            <p className="text-slate-500 font-medium">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">No Transactions Yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              You haven't made any payments yet. When you claim your certificate or make a payment, it will appear here.
            </p>
            <Button
              onClick={() => window.location.href = "/certificate"}
              rightIcon={<ArrowRight size={18} />}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6"
            >
              Go to Certificate
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold font-heading uppercase tracking-widest text-slate-500">
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-slate-600">
                      {payment.reference}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900">
                        {payment.paymentType === "CERTIFICATE" ? "Program Certificate" : "General Payment"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {payment.receiptUrl ? (
                        <button
                          onClick={() => window.open(payment.receiptUrl, "_blank")}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                        >
                          <Download size={14} /> Download
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
