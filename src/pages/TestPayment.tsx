import Navigation from "@/components/Navigation";
import PaymentTestForm from "@/components/PaymentTestForm";

export default function TestPayment() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <PaymentTestForm />
        </div>
      </div>
    </div>
  );
}