import React from "react";

function Forms({ title, fields, onSubmit }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-6">
        <legend className="fieldset-legend text-lg font-semibold px-2">
          {title}
        </legend>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = {};
            fields.forEach((f) => {
              formData[f.name] = e.target[f.name].value;
            });
            onSubmit(formData);
          }}
          className="flex flex-col gap-4 mt-2"
        >
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="label">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                className="input input-bordered w-full"
              />
            </div>
          ))}
          <button type="submit" className="btn btn-neutral mt-2">
            {title}
          </button>
        </form>
      </fieldset>
    </div>
  );
}
export default Forms;