import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  business_id: string;
  order_id: string;
  message: string;
  status: string;
  created_at: Date;
}

const NotificationSchema = new Schema<INotification>({
  business_id: { type: String, required: true, index: true },
  order_id: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema,
  'notifications'
);
