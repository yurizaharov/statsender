select * from
    (select
         t1.retail_network_id,
         t1.rn_title,
         t1.retail_point_id,
         t1.rp_title,
         t2.org_fee,
         t3.sms_fee,
         t4.cd_chg
     from
         (select
              rn.retail_network_id
               ,rn.title as rn_title
               ,rp.retail_point_id
               ,rp.title as rp_title
          from retail_points rp
                   join retail_networks rn on rp.network_id=rn.retail_network_id
          union
          select null, null, null, null from dual) t1
             left join
         (
             select
                 retail_network_id
                  ,retail_network_title rn_title
                  ,retail_point_id
                  ,retail_point_title rp_title
                  ,sum(organizer_fee) org_fee
             from buh_reports_data
             where
                 request_date between trunc((current_date)-1, 'Q') and trunc((current_date)-1)
             group by retail_network_id, retail_network_title, retail_point_id, retail_point_title) t2 on t1.retail_point_id=t2.retail_point_id
             full join
         (
             select
                 t_act.retail_network_id
                  ,t_act.rn_title
                  ,t_act.retail_point_id
                  ,t_act.rp_title
                  ,sum(tr.amount) sms_fee
             from transactions tr
                      join accounts a on tr.account_id=a.account_id
                      left join
                  (select
                       c.cli_id
                        ,rn.retail_network_id
                        ,rn.title as rn_title
                        ,rp.retail_point_id
                        ,rp.title as rp_title
                   from requests r
                            join terminals t on r.terminal_id=t.terminal_id
                            join retail_points rp on t.retail_point_id=rp.retail_point_id
                            join retail_networks rn on rp.network_id=rn.retail_network_id
                            join cards c on r.card_id=c.card_id
                            join
                        (select
                             c.cli_id
                              ,min(r.ins_date) ins_date
                         from requests r
                                  join cards c on r.card_id=c.card_id
                         where
                                 r.request_state = 'PROCESSED'
                           and r.request_type='PAYMENT_AND_CONFIRM'
                         group by c.cli_id) act_date on r.ins_date=act_date.ins_date
                            and c.cli_id=act_date.cli_id
                            and r.request_state = 'PROCESSED'
                            and r.request_type='PAYMENT_AND_CONFIRM'
                   group by
                       c.cli_id, rn.retail_network_id, rn.title, rp.retail_point_id, rp.title) t_act on a.cli_id=t_act.cli_id
             where
                     tr.transaction_state = 'PROCESSED'
               and tr.transaction_kind = 'SMS_NOTOFOCATION_FEE_CREDIT'
               and tr.ins_date between trunc((current_date)-1, 'Q') and trunc((current_date)-1)
             group by t_act.retail_network_id, t_act.rn_title, t_act.retail_point_id, t_act.rp_title
         ) t3 on t1.retail_point_id=t3.retail_point_id
             left join
         (select
              rn.retail_network_id
               ,rn.title as rn_title
               ,rp.retail_point_id
               ,rp.title as rp_title
               ,sum(tr.amount) cd_chg
          from transactions tr
                   join requests r on tr.request_id=r.request_id
                   left join terminals t on r.terminal_id=t.terminal_id
                   join retail_points rp on t.retail_point_id=rp.retail_point_id
                   join retail_networks rn on rp.network_id=rn.retail_network_id
          where
                  tr.transaction_state = 'PROCESSED'
            and tr.transaction_kind in ('CARD_EXCHANGE_CREDIT')
            and r.request_date between trunc((current_date)-1, 'Q') and trunc((current_date)-1)
          group by rn.retail_network_id, rn.title, rp.retail_point_id, rp.title
         ) t4 on t1.retail_point_id=t4.retail_point_id

    )
where (org_fee<>0 or sms_fee<>0 or cd_chg<>0)
