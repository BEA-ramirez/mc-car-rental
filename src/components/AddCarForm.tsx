"use client";

import { useActionState } from "react"; // Use 'react-dom' if on Next.js 14
import { createCar } from "@/actions/car"; // Import from your new organized file

export default function AddCarForm() {
  const [state, action, isPending] = useActionState(createCar, null);

  return (
    <form
      action={action}
      className="max-w-md mx-auto space-y-4 p-6 border rounded bg-white"
    >
      {/* 1. Text Inputs (Same as before) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="model">Car Model</label>
        <input
          name="model"
          id="model"
          className="border p-2 rounded"
          placeholder="Toyota Vios"
        />
        {state?.errors?.model && (
          <p className="text-red-500 text-sm">{state.errors.model}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="plate_number">Plate Number</label>
        <input
          name="plate_number"
          id="plate_number"
          className="border p-2 rounded"
          placeholder="ABC 123"
        />
        {state?.errors?.plate_number && (
          <p className="text-red-500 text-sm">{state.errors.plate_number}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price_per_day">Price (PHP)</label>
        <input
          name="price_per_day"
          id="price_per_day"
          type="number"
          className="border p-2 rounded"
        />
        {state?.errors?.price_per_day && (
          <p className="text-red-500 text-sm">{state.errors.price_per_day}</p>
        )}
      </div>

      {/* 2. THE NEW PART: File Input */}
      <div className="flex flex-col gap-1">
        <label htmlFor="image">Car Photo</label>
        <input
          type="file"
          name="image" // <--- Crucial: This matches formData.get('image')
          id="image"
          accept="image/*" // Limit to images only
          className="border p-2 rounded"
        />
        {/* We don't usually validate file client-side with Zod, but you can show server errors here if you add them */}
      </div>

      {/* 3. Global Message & Button */}
      {state?.message && (
        <div
          className={`p-2 rounded text-sm text-center ${
            state.message.includes("Success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Uploading & Saving..." : "Add Car"}
      </button>
    </form>
  );
}
