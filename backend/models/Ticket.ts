import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketMessage {
    sender: 'user' | 'admin';
    message: string;
    date: Date;
}

export interface ITicket extends Document {
    userId: mongoose.Types.ObjectId;
    subject: string;
    status: 'OPEN' | 'CLOSED' | 'RESOLVED';
    messages: ITicketMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'CLOSED', 'RESOLVED'], default: 'OPEN' },
    messages: [{
        sender: { type: String, enum: ['user', 'admin'], required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', ticketSchema);
