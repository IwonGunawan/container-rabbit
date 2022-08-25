/* STOCK */
// CREATE
rabbit_publish(routing_key+'-'+new Date().getTime(), {
        'type': 'notgoods',
        'device_id': token,
        'page_id': page_id,
        'notgood_id': save,
        'status': -9,
        'created_by': user_id
      }, queue);
// UPDATE
rabbit_publish(routing_key+'-'+new Date().getTime(), {
        'type': 'notgoods',
        'device_id': token,
        'page_id': page_id,
        'notgood_id': ng_id,
        'status': -8,
        'created_by': user_id
      }, queue);
// UPDATE STATUS
rabbit_publish(routing_key+'-'+new Date().getTime(), {
          'type': 'notgoods',
          'device_id': token,
          'page_id': page_id,
          'notgood_id': notgood_id,
          'status': -1,
          'created_by': user_id
        }, queue);


/* PURCHASE */
// CREATE 
await rabbitLib.publish(config.rabbit.queue.stock, {
        type: 'production_orders',
        action: 'create',
        data: {
          warehouse_company_id,
          warehouse_to,
          warehouse_from,
          supplier_id,
          pro_date,
          delivery_date,
          delivery_type,
          pic,
          note,
          items,
        },
        created_by: user.id,
        device_id,
        page_id,
      });
// CANCEL 
await rabbitLib.publish(config.rabbit.queue.stock, {
        device_id,
        page_id,
        production_order_id: proId,
        created_by: userId,
        type: "production_orders",
        action: "cancel"
      });
// UPDATE
await rabbitLib.publish(config.rabbit.queue.stock, {
        type: 'production_orders',
        action: 'edit',
        data: {
          production_order_id,
          warehouse_from,
          supplier_id,
          delivery_type,
          pic,
          note,
          items,
        },
        created_by: user.id,
        device_id,
        page_id,
      });


/* LOGISTIC */
// APPROVE
data_rabbits = []
data_rabbits.push({
              type: 'receive-order',
              device_id: token,
              page_id,
              order_id: data_order.id,
              old: order_old,
              created_by: user.id,
              note: note_received,
            });

/* ORDER */
// CREATE : NON-RTP
await rabbitLib.publish(config.rabbit.queue.stock, {
          device_id,
          page_id,
          orderId: order_id
        });

//UPDATE : NON-RTP
await rabbitLib.publish(config.rabbit.queue.stock, {
    type: 'update-order',
    device_id,
    page_id,
    order_id,
    old: data_old
  });
// GLOBAL INVOICE UPDATE : NON-RTP
await rabbitLib.publish(config.rabbit.queue.globalInvoice, {
          order_id,
          status: 'update_order',
        });

// CREATE : RTP 
await rabbitLib.publish(config.rabbit.queue.stock, {
          device_id,
          page_id,
          orderId: order_id
        });
// UPDATE : RTP
 await rabbitLib.publish(config.rabbit.queue.stock, {
            type: 'update-order',
            device_id,
            page_id,
            order_id,
            old: data_old
          });