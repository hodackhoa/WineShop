import React from 'react';
import {connect} from 'react-redux'
import '../../css/css-adminPage/orderManage.css'
import axios from '../../../node_modules/axios'
import TabNavAdmin from './tabNavAdmin.js'
import AdminFooter from './footer.js'
import AdminHeader from './header.js'
import FormatNum from '../formatMoney.js'
import FormatDate from '../formatDate.js';
import PageNumber from '../pageNumber.js'
import {getOrderData} from '../../action'

class OrderManage extends React.Component {
	constructor(props){
    super(props);
    this.state={
      orderData: [],
      totalItems: 0,
      hasShowList: true
    }
  }
  componentDidMount(){
    axios.get('http://localhost:3001/orders?_page=1&_limit=10')
    .then(response=>{
      //this.props.dispatch(getOrderData(response.data))
      this.setState({
        totalItems: parseInt(response.headers['x-total-count']),
        orderData: response.data
      })
    })
  }
  static getDerivedStateFromProps(props, state){
    if(props.orderData.length>0 && state.hasShowList){
      return{
        orderData: props.orderData,
        hasShowList: false
      }
    }
    else{
      return null
    }
  }
  handleListNum =(numberPage)=>{
    axios.get('http://localhost:3001/orders?_page='+ numberPage+'&_limit=10')
    .then(response=>{
      //console.log(response.data)
      this.setState({
        orderData: response.data
      })
    })
    
  }
  handleOrderStatus=(e)=>{
    if(e.target.value==2){
      axios.get('http://localhost:3001/orders?_page=1&_limit=10')
      .then(response=>{
        this.setState({
          orderData: response.data,
          totalItems: parseInt(response.headers['x-total-count'])
        })
      })
    }
    else{
      axios.get('http://localhost:3001/orders?_page=1&_limit=10&statusCheckout='+ e.target.value)
      .then(response=>{
        this.setState({
          orderData: response.data,
          totalItems: parseInt(response.headers['x-total-count'])
        })
      })
    }
  }
  handleCancel=(e,index,obj)=>{
    let objTemp = {...obj}
    objTemp.statusCheckout = 3
    axios.patch('http://localhost:3001/orders/'+ obj.id, objTemp)
    .then(response=>{
      console.log(response.data)
      this.state.orderData[index].statusCheckout = 3
      this.props.dispatch(getOrderData(this.state.orderData))
      this.setState({
        hasShowList: true
      })
    }).catch((err)=>{
      console.log(err)
    })
  }
  render(){
    const listOrders = this.state.orderData.map((item,index)=>{
      return (
        <div  key={index} className='orders-admin'>
          <div className='ordersAdmin-child' id ='infor-orderChild'>
            <h3>Mã đơn hàng: <span className='proNameSty'>{item.numObj}</span></h3>
            <h4>{FormatDate(item.dateCreate)}</h4>
          </div>
          <div className='ordersAdmin-child'>
            <h3>Trạng thái:
              <span className='proNameSty'>
                &nbsp;{(item.statusCheckout===1)?'Đã thanh toán'
                :(item.statusCheckout===0)?'Chưa thanh toán': 'Đã hủy'}
              </span>
            </h3>
          </div>
          <div className= 'ordersAdmin-child'>
            <h3>Tổng tiền: <span className='priceStyle'>{FormatNum(item.totalBill)}<sup>đ</sup></span></h3>
          </div>
          <div className= 'ordersAdmin-child' id= 'btn-ordersAdmin'>
            {(item.statusCheckout!==3)?
              <button className='btn-Default' onClick={(e)=>this.handleCancel(e,index,item)}>HỦY</button>
              : null}
          </div>
        </div>
      )
    })
    return (
	    <div className="orderManage">
        <AdminHeader/>
        <div className='admin-Layout'>
          <TabNavAdmin/>
          <div className='orderManage-main'>
            <div id='infor-orderManage'>
              <h2>QUẢN LÝ ĐƠN HÀNG</h2>
              <h3>SỐ LƯỢNG: {this.state.totalItems}</h3>
              <select onChange={this.handleOrderStatus}>
                <option value={2}>Tất cả</option>
                <option value={1}>Đã thanh toán</option>
                <option value={0}>Chưa thanh toán</option>
                <option value={3}>Đã hủy</option>
              </select>
            </div>
            <div id = 'list-orderManage'>
              {listOrders}
            </div>
            <PageNumber
              amountItem = {10}
              totalItems={this.state.totalItems}
              handleListNum={this.handleListNum}
            />
          </div>
          <AdminFooter/>
        </div>
	    </div>
    );
  }
}
const mapStateToProps=(state)=>{
  return{
    adminLogin: state.adminLogin,
    orderData: state.orderData
  }
}
const mapDispatchToProps=(dispatch)=>{
  return{
    dispatch
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(OrderManage);