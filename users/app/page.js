"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import { Info } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [open, setOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setPrediction(data.prediction);
    setConfidence((data.confidence * 100).toFixed(2));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative">
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 right-4 p-2 bg-white shadow-md rounded-full hover:bg-gray-100 transition z-50"
      >
        <Info className="w-6 h-6 text-gray-700" />
      </button>

      <Card className="w-full max-w-xl shadow-xl rounded-2xl p-4">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center mb-2">
            Dog vs Cat Classifier
          </CardTitle>
          <p className="text-center text-gray-500 text-sm">
            Upload an image and let the model predict
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <input
              type="file"
              accept="image/*"
              className="border rounded-lg p-2 w-full cursor-pointer"
              onChange={(e) => {
                const selected = e.target.files[0];
                setFile(selected);
                setPreview(URL.createObjectURL(selected));
              }}
            />

            {preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-2"
              >
                <Image
                  src={preview}
                  alt="Preview"
                  width={250}
                  height={250}
                  className="rounded-xl shadow-md object-cover"
                />
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full text-lg rounded-xl py-6 cursor-pointer"
            >
              Predict
            </Button>
          </form>

          {prediction && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 p-4 bg-gray-100 rounded-xl text-center shadow-sm"
            >
              <h2 className="text-2xl font-semibold">
                Prediction: {prediction}
              </h2>
              <h3 className="text-gray-600 mt-1 text-lg">
                {confidence}% Confidence
              </h3>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 max-w-md rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-700 hover:text-black"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-3">Model Information</h2>

            <p className="text-gray-700 mb-3">
              <strong>Confidence</strong> = The no. of % model is sure about its
              prediction.
            </p>

            <p className="text-gray-700 mb-3">
              This model is built using <strong>PyTorch CNN</strong> with around
              <strong> 80% accuracy</strong>.
            </p>

            <p className="text-gray-700 mb-3">
              It is trained on <strong>25,000+ images</strong> of dogs and cats.
              This project is part of my learning phase. I will upgrade and
              improve the accuracy in future versions.
            </p>

            <p className="text-gray-700">
              For suggestions or feedback:
              <br />
              <a
                href="mailto:gauravtarale67@gmail.com"
                className="text-blue-600 underline"
              >
                gauravtarale67@gmail.com
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
