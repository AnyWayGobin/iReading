import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    Text,
    TouchableOpacity,
    ToastAndroid, DeviceEventEmitter,
} from 'react-native';
import StorageOpt from "./StorageOpt"
import More from "./More"
import * as config from "./src/config";


const REQUEST_REGISTER = "https://www.wanandroid.com/user/register";
const REQUEST_LOGIN = "https://www.wanandroid.com/user/login";


export default class RegisterLogin extends Component {

    static navigationOptions = () => ({
        title: '登录注册',
        headerStyle: {
            backgroundColor: '#549cf8',
        },
        headerTintColor: '#fff',
    });

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            username: '',
            password: ''
        };
        this.fetchRegister = this.fetchRegister.bind(this);
        this.fetchLogin = this.fetchLogin.bind(this);
    }

    _onUserNameChanged = (userName) => {
        this.setState({username: userName});//setState方法是异步的，如果立即执行this.state.username是获取不到值的
        // console.log('username=' + this.state.username)
    };

    _onLoginPress = () => {
        if ("" === this.state.username) {
            ToastAndroid.show("请输入用户名", ToastAndroid.LONG);
            console.log('username=' + this.username);
            return;
        }
        if ("" === this.state.password) {
            ToastAndroid.show("请输入密码", ToastAndroid.LONG);
            return;
        }
        this.fetchLogin();
    };

    _onRegisterPress = () => {
        if ("" === this.state.username) {
            ToastAndroid.show("请输入用户名", ToastAndroid.LONG);
            console.log('username=' + this.username);
            return;
        }
        if ("" === this.state.password) {
            ToastAndroid.show("请输入密码", ToastAndroid.LONG);
            return;
        }
        this.fetchRegister();
    };

    /**
     * 该函数是_onLoginPress函数的一个子组件，所以直接使用this.state会报错undefined is not an object。相当于这个this是_onLoginPress
     * 那如何拿到全局的this呢？就是给fetchRegisterData函数绑定全局的this，即在构造函数中绑定：this.fetchRegisterData = this.fetchRegisterData.bind(this)
     */
    fetchRegister() {
        console.log("request data username=" + this.state.username + " password=" + this.state.password);
        let formData = new FormData();
        formData.append('username', this.state.username);
        formData.append('password', this.state.password);
        formData.append('repassword', this.state.password);
        console.log(formData);

        const request = new Request(REQUEST_REGISTER, {method: 'POST', body: formData});
        fetch(request)
            .then(response => {
            console.log(response.status);
            if (response.status === 200) {
                console.log(response);
                const cookie = response.headers.map['set-cookie'];
                if (cookie) {
                    StorageOpt.save(config.USER_NAME, this.state.username);
                    StorageOpt.save("cookie", cookie,null);
                }
                return response.json();
            }
            }).then(result => {
                console.log(result);
                if (result.errorCode === -1) {
                    ToastAndroid.show(result.errorMsg, ToastAndroid.LONG);
                } else if (result.errorCode === 0) {//注册成功
                    ToastAndroid.show("注册成功", ToastAndroid.LONG);
                    DeviceEventEmitter.emit(config.LOGIN_CALLBACK);
                    this.props.navigation.goBack();
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    fetchLogin() {
        let formData = new FormData();
        formData.append('username', this.state.username);
        formData.append('password', this.state.password);

        const request = new Request(REQUEST_LOGIN, {method: 'POST', body: formData});
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    const cookie = response.headers.map['set-cookie'];
                    if (cookie) {
                        StorageOpt.save(config.USER_NAME, this.state.username);
                        StorageOpt.save(config.COOKIE, cookie,null);
                    }
                    return response.json();
                }
            }).then(result => {
                    if (result.errorCode === -1) {
                        ToastAndroid.show(result.errorMsg, ToastAndroid.LONG);
                    } else if (result.errorCode === 0) {//登录成功
                        DeviceEventEmitter.emit(More.EVENT_NAME);
                        DeviceEventEmitter.emit(config.LOGIN_CALLBACK, this.state.username);
                        this.props.navigation.goBack();
                        ToastAndroid.show("登录成功", ToastAndroid.LONG);
                    }
        })
            .catch((error) => {
                console.log(error)
            })
    }


    render() {

        return (
            <View style={styles.container}>
                <TextInput style={styles.textInput} underlineColorAndroid='black'
                    placeholder="用户名"
                    onChangeText={this._onUserNameChanged}/>
                <TextInput style={styles.textInput} underlineColorAndroid='black'
                    placeholder="密码"
                           secureTextEntry={true}
                    onChangeText={(text) => {this.setState({password:text})}}/>
                <TouchableOpacity activeOpacity={0.6} style={styles.button} onPress={this._onLoginPress}>
                    <Text style={{color:'white'}}>登 录</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.6} style={styles.button} onPress={this._onRegisterPress}>
                    <Text style={{color:'white'}}>注 册</Text>
                </TouchableOpacity>

                {/*<Button title="Go to RegisterLogin by navigate" onPress={() => this.props.navigation.navigate("RegisterLogin")}/>

                <Button title="Go to RegisterLogin by push" onPress={() => this.props.navigation.push("RegisterLogin")}/>

                <Button title="Go to Collect by navigate" onPress={() => this.props.navigation.navigate("Collect")}/>

                <Button title="Go to Collect by push" onPress={() => this.props.navigation.push("Collect")}/>
                <Button title="Go Back" onPress={() => this.props.navigation.goBack()}/>*/}
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    textInput: {
        fontSize:20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
        marginRight: 20
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#549cf8',
        padding: 10,
        margin: 20,
        borderRadius: 5
    }
});