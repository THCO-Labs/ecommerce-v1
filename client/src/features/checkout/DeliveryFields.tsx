import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CheckoutInput } from "@/api/orders";

interface DeliveryFieldsProps {
  values: CheckoutInput;
  onChange: (patch: Partial<CheckoutInput>) => void;
  fieldErrors?: Record<string, string[]>;
}

function Field({
  id,
  label,
  value,
  onChange,
  errors,
  required = true,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {!required && <span className="text-muted-foreground text-xs">(optional)</span>}
      </Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={errors ? true : undefined}
      />
      {errors?.map((message) => (
        <p key={message} className="text-destructive text-xs">
          {message}
        </p>
      ))}
    </div>
  );
}

/**
 * Where the order is going. A phone number is required rather than optional:
 * a cash-on-delivery courier who cannot call has no way to complete the drop.
 */
export function DeliveryFields({ values, onChange, fieldErrors }: DeliveryFieldsProps) {
  return (
    <div data-builder-id="checkout.delivery" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="customerName"
          label="Full name"
          value={values.customerName}
          onChange={(customerName) => onChange({ customerName })}
          errors={fieldErrors?.customerName}
        />
        <Field
          id="customerPhone"
          label="Phone"
          type="tel"
          value={values.customerPhone}
          onChange={(customerPhone) => onChange({ customerPhone })}
          errors={fieldErrors?.customerPhone}
          placeholder="For the courier"
        />
      </div>

      <Field
        id="customerEmail"
        label="Email"
        type="email"
        value={values.customerEmail}
        onChange={(customerEmail) => onChange({ customerEmail })}
        errors={fieldErrors?.customerEmail}
        placeholder="Where your confirmation goes"
      />

      <Field
        id="addressLine1"
        label="Street address"
        value={values.addressLine1}
        onChange={(addressLine1) => onChange({ addressLine1 })}
        errors={fieldErrors?.addressLine1}
      />
      <Field
        id="addressLine2"
        label="Apartment, suite, etc."
        required={false}
        value={values.addressLine2 ?? ""}
        onChange={(addressLine2) => onChange({ addressLine2 })}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="city"
          label="City"
          value={values.city}
          onChange={(city) => onChange({ city })}
          errors={fieldErrors?.city}
        />
        <Field
          id="region"
          label="Region"
          required={false}
          value={values.region ?? ""}
          onChange={(region) => onChange({ region })}
        />
        <Field
          id="postalCode"
          label="Postcode"
          required={false}
          value={values.postalCode ?? ""}
          onChange={(postalCode) => onChange({ postalCode })}
        />
      </div>

      <Field
        id="country"
        label="Country"
        value={values.country}
        onChange={(country) => onChange({ country })}
        errors={fieldErrors?.country}
      />

      <div className="space-y-1.5">
        <Label htmlFor="notes">
          Delivery notes <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          value={values.notes ?? ""}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Gate code, safe place, best time to call"
          rows={3}
        />
      </div>
    </div>
  );
}
