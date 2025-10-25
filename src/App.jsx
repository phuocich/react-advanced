import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

// In-memory storage for the session
const sessionData = {
  experiences: [],
};

const ExperienceForm = () => {
  const { register, control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      experiences: [
        {
          companyName: "",
          position: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
          description: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  useEffect(() => {
    const savedData = sessionData.experiences;
    if (savedData && savedData.length > 0) {
      setValue("experiences", savedData);
    }
  }, [setValue]);

  const onSubmit = (data) => {
    sessionData.experiences = data.experiences;
    alert("Experiences saved successfully!");
  };

  const addExperience = () => {
    append({
      companyName: "",
      position: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    });
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <div className="card">
          <h1 className="title">Experience Form</h1>
          <p className="subtitle">
            Add and manage your professional experiences
          </p>

          <div>
            {fields.map((field, index) => (
              <div key={field.id} className="experience-box">
                <div className="experience-header">
                  <div>
                    <h2 className="experience-title">Experience {index + 1}</h2>
                    <p className="experience-subtitle">
                      Add your professional experience details
                    </p>
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="delete-button"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>

                <div className="fields-container">
                  <div className="row">
                    <div className="field-group">
                      <label className="label">Company Name</label>
                      <input
                        {...register(`experiences.${index}.companyName`)}
                        type="text"
                        placeholder="e.g., Acme Corporation"
                        className="input"
                      />
                    </div>

                    <div className="field-group">
                      <label className="label">Position</label>
                      <input
                        {...register(`experiences.${index}.position`)}
                        type="text"
                        placeholder="e.g., Senior Developer"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="field-group">
                      <label className="label">Start Date</label>
                      <input
                        {...register(`experiences.${index}.startDate`)}
                        type="date"
                        className="input"
                      />
                    </div>

                    <div className="field-group">
                      <label className="label">End Date</label>
                      <input
                        {...register(`experiences.${index}.endDate`)}
                        type="date"
                        disabled={watch(
                          `experiences.${index}.currentlyWorking`
                        )}
                        className={`input ${
                          watch(`experiences.${index}.currentlyWorking`)
                            ? "input-disabled"
                            : ""
                        }`}
                      />
                    </div>
                  </div>

                  <div className="checkbox-container">
                    <input
                      {...register(`experiences.${index}.currentlyWorking`)}
                      type="checkbox"
                      id={`currently-working-${index}`}
                      className="checkbox"
                    />
                    <label
                      htmlFor={`currently-working-${index}`}
                      className="checkbox-label"
                    >
                      I currently work here
                    </label>
                  </div>

                  <div className="field-group">
                    <label className="label">Description</label>
                    <textarea
                      {...register(`experiences.${index}.description`)}
                      rows={3}
                      placeholder="Describe your responsibilities and achievements..."
                      className="textarea"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addExperience}
              className="add-button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Experience
            </button>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="save-button"
            >
              Save Experiences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;
