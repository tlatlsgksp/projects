import prisma from '../prisma/client.js';

const loggableModels = ['User', 'Order', 'Subscription', 'PickupRequest'];

const alwaysFilterFields = ['password'];
const sensitiveFieldsForMasking = ['email', 'phone'];

const filterSensitiveFields = (model, data) => {
  if (!data || typeof data !== 'object') return data;

  const filtered = { ...data };

  alwaysFilterFields.forEach(field => {
    if (field in filtered) delete filtered[field];
  });

  return filtered;
};

export const loggingMiddleware = async (params, next) => {
  const { model, action, args } = params;

  if (!loggableModels.includes(model) || !['create', 'update', 'delete'].includes(action)) {
    return next(params);
  }

  let before = null;
  const recordId = args?.where?.id;

  if ((action === 'update' || action === 'delete') && recordId) {
    const original = await prisma[model.toLowerCase()].findUnique({ where: { id: recordId } });
    before = filterSensitiveFields(model, original);
  }

  const result = await next(params);

  const after = filterSensitiveFields(model, result);

  try {
    await prisma.activityLog.create({
        data: {
        model,
        action,
        recordId: result.id,
        changes: { before, after },
        },
    });
    } catch (logErr) {
    }

  return result;
};