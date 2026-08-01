import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    business_id: string;
    order_id: string;
    status: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    business_id: { type: String, required: true },
    order_id: { type: String, required: true },
    status: { type: String, required: true },
    message: { type: String, default: '' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { 
    collection: 'notifications' 
});

// Express explicitly owns the `notifications` collection
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
